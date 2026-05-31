import SwiftUI
import WebKit

struct AppWebView: UIViewRepresentable {
    @ObservedObject var model: WebViewModel
    let config: AppConfig
    let onBridgeMessage: (IAPBridgeMessage, [HTTPCookie]) -> Void

    init(
        model: WebViewModel,
        config: AppConfig,
        onBridgeMessage: @escaping (IAPBridgeMessage, [HTTPCookie]) -> Void = { _, _ in }
    ) {
        self.model = model
        self.config = config
        self.onBridgeMessage = onBridgeMessage
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(model: model, onBridgeMessage: onBridgeMessage, onReviewRequested: { StoreReviewController.request() })
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.applicationNameForUserAgent = config.iosUserAgentToken
        configuration.websiteDataStore = .default()
        configuration.userContentController.add(context.coordinator, name: "iap")
        configuration.userContentController.add(context.coordinator, name: "review")

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.load(URLRequest(url: model.currentURL))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        guard webView.url != model.currentURL else { return }
        webView.load(URLRequest(url: model.currentURL))
    }

    static func dismantleUIView(_ webView: WKWebView, coordinator: Coordinator) {
        webView.navigationDelegate = nil
        webView.configuration.userContentController.removeScriptMessageHandler(forName: "iap")
        webView.configuration.userContentController.removeScriptMessageHandler(forName: "review")
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        private let model: WebViewModel
        private let onBridgeMessage: (IAPBridgeMessage, [HTTPCookie]) -> Void
        private let onReviewRequested: () -> Void

        init(
            model: WebViewModel,
            onBridgeMessage: @escaping (IAPBridgeMessage, [HTTPCookie]) -> Void,
            onReviewRequested: @escaping () -> Void = { StoreReviewController.request() }
        ) {
            self.model = model
            self.onBridgeMessage = onBridgeMessage
            self.onReviewRequested = onReviewRequested
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            switch message.name {
            case "iap":
                guard let bridgeMessage = IAPBridgeMessage(body: message.body) else { return }
                WKWebsiteDataStore.default().httpCookieStore.getAllCookies { cookies in
                    DispatchQueue.main.async {
                        self.onBridgeMessage(bridgeMessage, cookies)
                    }
                }
            case "review":
                DispatchQueue.main.async {
                    self.onReviewRequested()
                }
            default:
                break
            }
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.cancel)
                return
            }

            decisionHandler(model.canOpen(url) ? .allow : .cancel)
        }
    }
}

extension WKHTTPCookieStore {
    func allCookies() async -> [HTTPCookie] {
        await withCheckedContinuation { continuation in
            getAllCookies { cookies in
                continuation.resume(returning: cookies)
            }
        }
    }

    func setCookies(_ cookies: [HTTPCookie]) async {
        for cookie in cookies {
            await withCheckedContinuation { continuation in
                setCookie(cookie) {
                    continuation.resume()
                }
            }
        }
    }
}
