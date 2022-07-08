/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "@keystone-ui/core";
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const originalRenderPage = ctx.renderPage;

    // Run the React rendering logic synchronously
    ctx.renderPage = () =>
      originalRenderPage({
        // Useful for wrapping the whole react tree
        enhanceApp: (App) => App,
        // Useful for wrapping in a per-page basis
        enhanceComponent: (Component) => Component,
      });

    // Run the parent `getInitialProps`, it now includes the custom `renderPage`
    //@ts-ignore
    const initialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }

  render() {
    return (
      <Html>
        <head>
          <title>Auto BSe</title>
          <link
            rel="icon"
            type="image/x-icon"
            href="/images/logo/favicon.png"
          ></link>
          <style>{`
              div[role*=dialog] div div a , div[role*=dialog] div div div[class*=-Divider]{
                display: none;
              }
              td div {
                line-height: 100% !important;
                width: 100% !important;
              }
              td label div {
                width: initial !important;
              }
            `}</style>
        </head>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
