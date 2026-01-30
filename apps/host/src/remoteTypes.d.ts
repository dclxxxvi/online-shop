// Type declarations for Module Federation remotes

declare module 'editor/App' {
  const App: React.ComponentType;
  export default App;
}

declare module 'storefront/App' {
  interface StorefrontAppProps {
    subdomain?: string;
  }
  const App: React.ComponentType<StorefrontAppProps>;
  export default App;
}