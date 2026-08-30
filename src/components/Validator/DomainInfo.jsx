import { useState } from "react";
import { Input, Button, Card, Row, Col, Typography, Tag, Table, Spin, Space, Empty } from "antd";
import { SearchOutlined, GlobalOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { emailApi } from "../../services/api";

const { Title, Text, Paragraph } = Typography;

export default function DomainInfo() {
  const [domain, setDomain] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!cleanDomain) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await emailApi.getDomainInfo(cleanDomain);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to retrieve domain information");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <Title level={2} style={{ color: "#f1f5f9", margin: 0 }}>
          🌐 Domain DNS & Auth Lookup
        </Title>
        <Paragraph style={{ color: "#64748b", marginTop: 6 }}>
          Inspect mail exchange (MX), SPF, DMARC, DKIM, and disposable configuration for any domain.
        </Paragraph>
      </motion.div>

      <div style={{
        background: "#13131a", border: "1px solid #2a2a3a",
        borderRadius: 16, padding: "20px 24px", marginBottom: 24,
      }}>
        <div style={{ display: "flex", gap: 12 }}>
          <Input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter domain (e.g., google.com, github.com, mailinator.com)..."
            prefix={<GlobalOutlined style={{ color: "#6366f1" }} />}
            size="large"
            disabled={loading}
          />
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={loading}
            style={{ minWidth: 120, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", fontWeight: 700 }}
          >
            Lookup
          </Button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: 16, background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10,
          color: "#f87171", marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: 60 }}>
          <Spin size="large" />
          <Text style={{ color: "#64748b", display: "block", marginTop: 16 }}>
            Querying DNS, MX, SPF, DMARC records...
          </Text>
        </div>
      )}

      {data && !loading && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card
            title={
              <Space>
                <GlobalOutlined style={{ color: "#6366f1" }} />
                <Text style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 16 }}>{data.domain}</Text>
                {data.dns?.domain_exists ? (
                  <Tag color="success">Active Domain</Tag>
                ) : (
                  <Tag color="error">Domain Not Found</Tag>
                )}
                {data.disposable?.is_disposable && <Tag color="error">Disposable</Tag>}
                {data.disposable?.is_free_provider && <Tag color="blue">Free Provider</Tag>}
              </Space>
            }
            style={{ background: "#13131a", border: "1px solid #2a2a3a", borderRadius: 16, marginBottom: 20 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div style={{ background: "#0a0a0f", padding: 16, borderRadius: 10, border: "1px solid #1e1e2e" }}>
                  <Text strong style={{ color: "#94a3b8", display: "block", marginBottom: 8 }}>Authentication Status</Text>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text style={{ color: "#64748b" }}>SPF Record:</Text>
                      {data.dns?.has_spf ? <Tag color="green" icon={<CheckCircleOutlined />}>Present</Tag> : <Tag color="red" icon={<CloseCircleOutlined />}>Missing</Tag>}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text style={{ color: "#64748b" }}>DMARC Record:</Text>
                      {data.dns?.has_dmarc ? <Tag color="green" icon={<CheckCircleOutlined />}>Present</Tag> : <Tag color="red" icon={<CloseCircleOutlined />}>Missing</Tag>}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text style={{ color: "#64748b" }}>DKIM Record:</Text>
                      {data.dns?.has_dkim ? <Tag color="green" icon={<CheckCircleOutlined />}>Found</Tag> : <Tag color="default">Not Detected</Tag>}
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div style={{ background: "#0a0a0f", padding: 16, borderRadius: 10, border: "1px solid #1e1e2e" }}>
                  <Text strong style={{ color: "#94a3b8", display: "block", marginBottom: 8 }}>Domain Classification</Text>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text style={{ color: "#64748b" }}>Disposable / Burner:</Text>
                      <Text style={{ color: data.disposable?.is_disposable ? "#ef4444" : "#10b981", fontWeight: 600 }}>
                        {data.disposable?.is_disposable ? "YES" : "NO"}
                      </Text>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text style={{ color: "#64748b" }}>Free Provider:</Text>
                      <Text style={{ color: "#94a3b8" }}>{data.disposable?.is_free_provider ? "Yes" : "No"}</Text>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text style={{ color: "#64748b" }}>MX Host Count:</Text>
                      <Text style={{ color: "#94a3b8" }}>{data.dns?.mx_records?.length || 0}</Text>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>

            {data.dns?.spf_record && (
              <div style={{ marginTop: 16, background: "#0a0a0f", padding: 12, borderRadius: 8, border: "1px solid #1e1e2e" }}>
                <Text style={{ color: "#6366f1", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>SPF Record Value</Text>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#e2e8f0", wordBreak: "break-all", marginTop: 4 }}>
                  {data.dns.spf_record}
                </div>
              </div>
            )}

            {data.dns?.dmarc_record && (
              <div style={{ marginTop: 12, background: "#0a0a0f", padding: 12, borderRadius: 8, border: "1px solid #1e1e2e" }}>
                <Text style={{ color: "#6366f1", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>DMARC Record Value</Text>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#e2e8f0", wordBreak: "break-all", marginTop: 4 }}>
                  {data.dns.dmarc_record}
                </div>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <Text strong style={{ color: "#94a3b8", display: "block", marginBottom: 8 }}>
                Mail Exchange (MX) Records
              </Text>
              {(!data.dns?.mx_records || data.dns.mx_records.length === 0) ? (
                <Empty description="No MX records found" style={{ padding: 20 }} />
              ) : (
                <Table
                  dataSource={data.dns.mx_records.map((mx, i) => ({ ...mx, key: i }))}
                  columns={[
                    { title: "Priority", dataIndex: "priority", key: "priority", width: 90, sorter: (a, b) => a.priority - b.priority },
                    { title: "Host / Mail Server", dataIndex: "host", key: "host", render: (h) => <Text style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#e2e8f0" }}>{h}</Text> },
                  ]}
                  size="small"
                  pagination={false}
                />
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
