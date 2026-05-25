import SwiftUI
import WebKit

struct ContentView: View {
    @ObservedObject var webViewModel: WebViewModel
    @StateObject private var iapController: IAPController

    init(webViewModel: WebViewModel) {
        self.webViewModel = webViewModel
        _iapController = StateObject(wrappedValue: IAPController(config: webViewModel.config))
    }

    var body: some View {
        AppWebView(
            model: webViewModel,
            config: webViewModel.config,
            onBridgeMessage: handleBridgeMessage
        )
            .ignoresSafeArea(.container, edges: .bottom)
            .task {
                iapController.startTransactionUpdates(
                    cookies: { await WKWebsiteDataStore.default().httpCookieStore.allCookies() },
                    onVerified: { webViewModel.openHome() }
                )
            }
            .alert("購入処理", isPresented: statusAlertBinding) {
                Button("OK", role: .cancel) {
                    iapController.clearStatus()
                }
            } message: {
                Text(iapController.statusMessage ?? "")
            }
    }

    private var statusAlertBinding: Binding<Bool> {
        Binding(
            get: { iapController.statusMessage != nil },
            set: { isPresented in
                if !isPresented {
                    iapController.clearStatus()
                }
            }
        )
    }

    private func handleBridgeMessage(_ message: IAPBridgeMessage, cookies: [HTTPCookie]) {
        Task {
            let verified: Bool
            switch message {
            case .purchase:
                verified = await iapController.purchase(cookies: cookies)
            case .restore:
                verified = await iapController.restore(cookies: cookies)
            }

            if verified {
                webViewModel.openHome()
            }
        }
    }
}
