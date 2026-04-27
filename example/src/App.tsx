import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useApiInspector, InspectorProvider } from 'rn-api-inspector';
import axios from 'axios';
import { useState, useCallback } from 'react';

// ── Helpers ──────────────────────────────────────────────────────────────────

const BASE = 'https://jsonplaceholder.typicode.com';
const HTTPBIN = 'https://httpbin.org';

const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(() => resolve(true), ms));

// ── Section component ────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

// ── Pill button ──────────────────────────────────────────────────────────────

function Btn({
  label,
  color = '#6C63FF',
  onPress,
}: {
  label: string;
  color?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Main app ─────────────────────────────────────────────────────────────────

export default function App() {
  useApiInspector(axios);

  const run = useCallback(async (label: string, fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (e: any) {
      console.error(`✗ ${label}: ${e.message}`);
    }
  }, []);

  // ─── Fetch: Standard Methods ────────────────────────────────────────────

  const fetchGet = () =>
    run('Fetch GET', async () => {
      await fetch(`${BASE}/posts/1`);
    });

  const fetchGetQueryParams = () =>
    run('Fetch GET + Params', async () => {
      await fetch(`${BASE}/posts?userId=1&_limit=5`);
    });

  const fetchPost = () =>
    run('Fetch POST', async () => {
      await fetch(`${BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Inspector Test',
          body: 'Created via rn-api-inspector example',
          userId: 1,
        }),
      });
    });

  const fetchPut = () =>
    run('Fetch PUT', async () => {
      await fetch(`${BASE}/posts/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 1,
          title: 'Updated Title',
          body: 'Full replacement via PUT',
          userId: 1,
        }),
      });
    });

  const fetchPatch = () =>
    run('Fetch PATCH', async () => {
      await fetch(`${BASE}/posts/1`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Patched Title' }),
      });
    });

  const fetchDelete = () =>
    run('Fetch DELETE', async () => {
      await fetch(`${BASE}/posts/1`, { method: 'DELETE' });
    });

  const fetchHead = () =>
    run('Fetch HEAD', async () => {
      await fetch(`${BASE}/posts/1`, { method: 'HEAD' });
    });

  // ─── Fetch: Headers & Auth ──────────────────────────────────────────────

  const fetchCustomHeaders = () =>
    run('Custom Headers', async () => {
      await fetch(`${BASE}/posts/1`, {
        headers: {
          'Authorization': 'Bearer super_secret_token_12345',
          'X-API-KEY': 'my-api-key-abc',
          'X-Request-ID': 'req_' + Date.now(),
          'Accept': 'application/json',
          'X-Custom-Header': 'inspector-test',
        },
      });
    });

  const fetchFormUrlEncoded = () =>
    run('Form URL-Encoded', async () => {
      await fetch(`${HTTPBIN}/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'username=testuser&password=secret123&remember=true',
      });
    });

  // ─── Fetch: Error Scenarios ─────────────────────────────────────────────

  const fetch404 = () =>
    run('404 Not Found', async () => {
      await fetch(`${BASE}/posts/99999`);
    });

  const fetch500 = () =>
    run('500 Server Error', async () => {
      await fetch(`${HTTPBIN}/status/500`);
    });

  const fetchNetworkError = () =>
    run('Network Error', async () => {
      await fetch('https://this-domain-does-not-exist-12345.com/api');
    });

  const fetchTimeout = () =>
    run('Timeout (AbortController)', async () => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 100);
      await fetch(`${HTTPBIN}/delay/10`, { signal: controller.signal });
    });

  const fetchAbort = () =>
    run('Manual Abort', async () => {
      const controller = new AbortController();
      const promise = fetch(`${HTTPBIN}/delay/5`, {
        signal: controller.signal,
      });
      await wait(50);
      controller.abort();
      await promise;
    });

  // ─── Fetch: Misc ────────────────────────────────────────────────────────

  const fetchLargePayload = () =>
    run('Large Response', async () => {
      await fetch(`${BASE}/comments`);
    });

  const fetchConcurrent = () =>
    run('Concurrent (3x)', async () => {
      await Promise.all([
        fetch(`${BASE}/posts/1`),
        fetch(`${BASE}/posts/2`),
        fetch(`${BASE}/posts/3`),
      ]);
    });

  const fetchSequential = () =>
    run('Sequential Chain', async () => {
      const res = await fetch(`${BASE}/posts/1`);
      const post = await res.json();
      await fetch(`${BASE}/users/${post.userId}`);
      await fetch(`${BASE}/posts/${post.id}/comments`);
    });

  const fetchGraphQL = () =>
    run('GraphQL Query', async () => {
      await fetch('https://countries.trevorblades.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `{
            countries(filter: { continent: { eq: "AS" } }) {
              code
              name
              capital
              currency
            }
          }`,
        }),
      });
    });

  const fetchSlowResponse = () =>
    run('Slow Response (2s)', async () => {
      await fetch(`${HTTPBIN}/delay/2`);
    });

  const fetchRedirect = () =>
    run('Redirect (302)', async () => {
      await fetch(`${HTTPBIN}/redirect/2`);
    });

  const fetchImageBinary = () =>
    run('Binary Image', async () => {
      await fetch(`${HTTPBIN}/image/png`);
    });

  // ─── Axios: Standard Methods ────────────────────────────────────────────

  const axiosGet = () =>
    run('Axios GET', async () => {
      await axios.get(`${BASE}/users`);
    });

  const axiosGetParams = () =>
    run('Axios GET + Params', async () => {
      await axios.get(`${BASE}/comments`, {
        params: { postId: 1, _limit: 3 },
      });
    });

  const axiosPost = () =>
    run('Axios POST', async () => {
      await axios.post(`${BASE}/posts`, {
        title: 'Axios Inspector Test',
        body: 'Created via axios in rn-api-inspector',
        userId: 2,
      });
    });

  const axiosPut = () =>
    run('Axios PUT', async () => {
      await axios.put(`${BASE}/posts/1`, {
        id: 1,
        title: 'Axios Updated Title',
        body: 'Full replacement via Axios PUT',
        userId: 1,
      });
    });

  const axiosPatch = () =>
    run('Axios PATCH', async () => {
      await axios.patch(`${BASE}/posts/1`, {
        title: 'Axios Patched Title',
      });
    });

  const axiosDelete = () =>
    run('Axios DELETE', async () => {
      await axios.delete(`${BASE}/posts/1`);
    });

  const axiosHead = () =>
    run('Axios HEAD', async () => {
      await axios.head(`${BASE}/posts/1`);
    });

  // ─── Axios: Headers & Auth ──────────────────────────────────────────────

  const axiosCustomHeaders = () =>
    run('Axios Custom Headers', async () => {
      await axios.get(`${BASE}/posts/1`, {
        headers: {
          'Authorization': 'Bearer axios_token_xyz',
          'X-API-KEY': 'axios-api-key',
          'X-Correlation-ID': 'corr_' + Date.now(),
          'Accept-Language': 'en-US',
        },
      });
    });

  const axiosFormData = () =>
    run('Axios FormData', async () => {
      const data = new FormData();
      data.append('name', 'Inspector User');
      data.append('email', 'test@example.com');
      data.append('role', 'developer');
      await axios.post(`${HTTPBIN}/post`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    });

  // ─── Axios: Error Scenarios ─────────────────────────────────────────────

  const axios404 = () =>
    run('Axios 404', async () => {
      await axios.get(`${BASE}/posts/99999`);
    });

  const axios500 = () =>
    run('Axios 500', async () => {
      await axios.get(`${HTTPBIN}/status/500`);
    });

  const axiosNetworkError = () =>
    run('Axios Network Error', async () => {
      await axios.get('https://this-domain-does-not-exist-12345.com/api');
    });

  const axiosTimeout = () =>
    run('Axios Timeout', async () => {
      await axios.get(`${HTTPBIN}/delay/10`, { timeout: 200 });
    });

  const axiosCancelToken = () =>
    run('Axios Cancel', async () => {
      const controller = new AbortController();
      const promise = axios.get(`${HTTPBIN}/delay/5`, {
        signal: controller.signal,
      });
      await wait(50);
      controller.abort();
      await promise;
    });

  // ─── Axios: Misc ────────────────────────────────────────────────────────

  const axiosConcurrent = () =>
    run('Axios Concurrent', async () => {
      await Promise.all([
        axios.get(`${BASE}/users/1`),
        axios.get(`${BASE}/users/2`),
        axios.get(`${BASE}/users/3`),
      ]);
    });

  const axiosGraphQL = () =>
    run('Axios GraphQL', async () => {
      await axios.post('https://countries.trevorblades.com/graphql', {
        query: `{
          country(code: "IN") {
            name
            capital
            currency
            languages { name }
          }
        }`,
      });
    });

  // ─── Rapid Fire ─────────────────────────────────────────────────────────

  const rapidFire = () =>
    run('Rapid Fire (10x)', async () => {
      const requests = Array.from({ length: 10 }, (_, i) =>
        fetch(`${BASE}/posts/${i + 1}`)
      );
      await Promise.all(requests);
    });

  const mixedBatch = () =>
    run('Mixed Batch', async () => {
      await Promise.all([
        fetch(`${BASE}/posts/1`),
        axios.get(`${BASE}/users/1`),
        fetch(`${BASE}/comments?postId=1`),
        axios.get(`${BASE}/albums/1`),
        fetch(`${BASE}/photos?albumId=1&_limit=2`),
      ]);
    });

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <InspectorProvider>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔍 API Inspector</Text>
          <Text style={styles.headerSubtitle}>
            Tap any button, then open the inspector panel
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Fetch: HTTP Methods ─────────────────────────── */}
          <Section title="Fetch — HTTP Methods">
            <Btn label="GET" onPress={fetchGet} />
            <Btn label="GET + Query Params" onPress={fetchGetQueryParams} />
            <Btn label="POST (JSON)" onPress={fetchPost} />
            <Btn label="PUT" onPress={fetchPut} />
            <Btn label="PATCH" onPress={fetchPatch} />
            <Btn label="DELETE" onPress={fetchDelete} />
            <Btn label="HEAD" onPress={fetchHead} />
          </Section>

          {/* ── Fetch: Headers & Payloads ──────────────────── */}
          <Section title="Fetch — Headers & Payloads">
            <Btn
              label="Custom Headers + Auth"
              color="#E91E8C"
              onPress={fetchCustomHeaders}
            />
            <Btn
              label="Form URL-Encoded"
              color="#E91E8C"
              onPress={fetchFormUrlEncoded}
            />
            <Btn label="GraphQL Query" color="#E91E8C" onPress={fetchGraphQL} />
          </Section>

          {/* ── Fetch: Error Scenarios ─────────────────────── */}
          <Section title="Fetch — Error Scenarios">
            <Btn label="404 Not Found" color="#FF5252" onPress={fetch404} />
            <Btn label="500 Server Error" color="#FF5252" onPress={fetch500} />
            <Btn
              label="Network Error"
              color="#FF5252"
              onPress={fetchNetworkError}
            />
            <Btn
              label="Timeout (Abort)"
              color="#FF5252"
              onPress={fetchTimeout}
            />
            <Btn label="Manual Abort" color="#FF5252" onPress={fetchAbort} />
          </Section>

          {/* ── Fetch: Misc ────────────────────────────────── */}
          <Section title="Fetch — Misc">
            <Btn
              label="Large Response"
              color="#00BFA5"
              onPress={fetchLargePayload}
            />
            <Btn
              label="Slow (2s delay)"
              color="#00BFA5"
              onPress={fetchSlowResponse}
            />
            <Btn
              label="Redirect (302)"
              color="#00BFA5"
              onPress={fetchRedirect}
            />
            <Btn
              label="Binary Image"
              color="#00BFA5"
              onPress={fetchImageBinary}
            />
            <Btn
              label="Concurrent (3x)"
              color="#00BFA5"
              onPress={fetchConcurrent}
            />
            <Btn
              label="Sequential Chain"
              color="#00BFA5"
              onPress={fetchSequential}
            />
          </Section>

          {/* ── Axios: HTTP Methods ────────────────────────── */}
          <Section title="Axios — HTTP Methods">
            <Btn label="GET" color="#FF9800" onPress={axiosGet} />
            <Btn
              label="GET + Params"
              color="#FF9800"
              onPress={axiosGetParams}
            />
            <Btn label="POST (JSON)" color="#FF9800" onPress={axiosPost} />
            <Btn label="PUT" color="#FF9800" onPress={axiosPut} />
            <Btn label="PATCH" color="#FF9800" onPress={axiosPatch} />
            <Btn label="DELETE" color="#FF9800" onPress={axiosDelete} />
            <Btn label="HEAD" color="#FF9800" onPress={axiosHead} />
          </Section>

          {/* ── Axios: Headers & Payloads ──────────────────── */}
          <Section title="Axios — Headers & Payloads">
            <Btn
              label="Custom Headers + Auth"
              color="#AB47BC"
              onPress={axiosCustomHeaders}
            />
            <Btn
              label="FormData (Multipart)"
              color="#AB47BC"
              onPress={axiosFormData}
            />
            <Btn label="GraphQL Query" color="#AB47BC" onPress={axiosGraphQL} />
          </Section>

          {/* ── Axios: Error Scenarios ─────────────────────── */}
          <Section title="Axios — Error Scenarios">
            <Btn label="404 Not Found" color="#F44336" onPress={axios404} />
            <Btn label="500 Server Error" color="#F44336" onPress={axios500} />
            <Btn
              label="Network Error"
              color="#F44336"
              onPress={axiosNetworkError}
            />
            <Btn
              label="Timeout (200ms)"
              color="#F44336"
              onPress={axiosTimeout}
            />
            <Btn
              label="Cancel (AbortController)"
              color="#F44336"
              onPress={axiosCancelToken}
            />
          </Section>

          {/* ── Axios: Misc ────────────────────────────────── */}
          <Section title="Axios — Misc">
            <Btn
              label="Concurrent (3x)"
              color="#00ACC1"
              onPress={axiosConcurrent}
            />
          </Section>

          {/* ── Stress Tests ───────────────────────────────── */}
          <Section title="Stress Tests">
            <Btn
              label="🔥 Rapid Fire (10 GETs)"
              color="#FF6D00"
              onPress={rapidFire}
            />
            <Btn
              label="🎲 Mixed Batch (fetch + axios)"
              color="#FF6D00"
              onPress={mixedBatch}
            />
          </Section>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              rn-api-inspector • Example App
            </Text>
          </View>
        </ScrollView>
      </InspectorProvider>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F0F14',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#16161D',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A2A35',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8888A0',
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },

  // Section
  section: {
    marginBottom: 16,
    borderRadius: 14,
    backgroundColor: '#1A1A24',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A35',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1E1E2A',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E0E0F0',
    letterSpacing: 0.2,
  },
  chevron: {
    fontSize: 12,
    color: '#6C63FF',
  },
  sectionBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },

  // Button
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    color: '#4A4A5A',
    fontSize: 12,
  },
});
