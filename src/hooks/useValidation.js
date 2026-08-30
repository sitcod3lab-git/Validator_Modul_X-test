import { useState, useCallback } from 'react';
import { emailApi } from '../services/api';

export const useSingleValidation = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const validate = useCallback(async (email, deep = true) => {
    setLoading(true);
    setError(null);
    try {
      const data = await emailApi.validateSingle(email, deep);
      setResult(data);
      setHistory(prev => {
        const filtered = prev.filter(item => item.email !== email);
        return [data, ...filtered].slice(0, 50); // Cap local history at 50 records
      });
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Validation failed';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return { result, loading, error, history, validate, reset };
};

export const useBulkValidation = () => {
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'completed' | 'failed'
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [error, setError] = useState(null);

  const pollStatus = useCallback((id) => {
    const interval = setInterval(async () => {
      try {
        const data = await emailApi.getBulkStatus(id);
        setStatus(data.status.toLowerCase());
        setProcessed(data.processed || 0);
        setTotal(data.total || 0);
        setProgress(data.total > 0 ? Math.round((data.processed / data.total) * 100) : 0);

        if (data.status === 'SUCCESS' || data.status === 'COMPLETED') {
          clearInterval(interval);
          setResults(data.results || []);
          setStatus('completed');
        } else if (data.status === 'FAILED' || data.status === 'FAILURE') {
          clearInterval(interval);
          setError(data.message || 'Worker process failed');
          setStatus('failed');
        }
      } catch (err) {
        clearInterval(interval);
        setError(err.message || 'Polling failure');
        setStatus('failed');
      }
    }, 2000);

    return interval;
  }, []);

  const startBulk = useCallback(async (emails, webhookUrl = null) => {
    setResults([]);
    setProgress(0);
    setProcessed(0);
    setTotal(emails.length);
    setError(null);
    setStatus('processing');

    try {
      const data = await emailApi.validateBulk(emails, webhookUrl);
      
      // In the case of fallback bulk, if results are returned immediately
      if (data.results && !data.task_id) {
        setResults(data.results);
        setProgress(100);
        setProcessed(emails.length);
        setStatus('completed');
      } else if (data.task_id) {
        setTaskId(data.task_id);
        return pollStatus(data.task_id);
      } else {
        throw new Error('Invalid server response signature');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Bulk submission failed';
      setError(errMsg);
      setStatus('failed');
    }
  }, [pollStatus]);

  const reset = useCallback(() => {
    setTaskId(null);
    setStatus('idle');
    setResults([]);
    setProgress(0);
    setTotal(0);
    setProcessed(0);
    setError(null);
  }, []);

  return { taskId, status, results, progress, total, processed, error, startBulk, reset };
};
