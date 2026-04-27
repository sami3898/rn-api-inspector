# rn-api-inspector

Inspect API calls (fetch + axios) in real time inside your React Native app.

## Installation

```sh
npm install rn-api-inspector
# Or
yarn add rn-api-inspector
```

### Expo Users

This library works with Expo! Since it relies on `@react-native-clipboard/clipboard`, you'll need to use [Development Builds](https://docs.expo.dev/development/introduction/) (recommended) or run `npx expo prebuild`.

```sh
npx expo install @react-native-clipboard/clipboard
```

Wrap your app with `InspectorProvider` and call `useApiInspector()` once.

If you use `axios`, pass your instance to the hook for automatic interception.

```tsx
import axios from 'axios';
import { InspectorProvider, useApiInspector } from 'rn-api-inspector';

export default function App() {
  useApiInspector(axios); // Optional: pass axios instance

  return <InspectorProvider>{/* your app */}</InspectorProvider>;
}
```

### Manual Axios Setup

If you prefer manual control or matching specific instances later:

```ts
import axios from 'axios';
import { attachAxiosInterceptor } from 'rn-api-inspector';

attachAxiosInterceptor(axios);
```

## Advanced (manual start/stop)

Use this if you want explicit lifecycle control (e.g. only enable in a specific screen).

```ts
import axios from 'axios';
import { startApiInspector } from 'rn-api-inspector';

const { stop } = startApiInspector({
  enabled: __DEV__,
  axios, // optional
  autoAttachAxios: false, // optional
});

// later (important!)
stop();
```

## Notes

- **Dev-only by default**: `useApiInspector()` enables itself only when `__DEV__` is true.
- **Cleanup supported**: `startApiInspector()` returns a `stop()` function that detaches interceptors.
- **Payload safety**: large response bodies are truncated to keep the UI responsive.
- **Header redaction by default**: sensitive headers like `Authorization`, `Cookie`, and `X-API-KEY` are masked.
- **Export formats**: you can copy/share JSON, cURL, and HAR-lite from the inspector UI.

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
