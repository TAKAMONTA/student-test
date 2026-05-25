import Combine
import Foundation

final class WebViewModel: ObservableObject {
    let config: AppConfig
    @Published private(set) var currentURL: URL

    init(config: AppConfig) {
        self.config = config
        self.currentURL = config.appURL.appending(path: "login")
    }

    func open(_ url: URL) {
        guard canOpen(url) else {
            openLogin()
            return
        }

        currentURL = url
    }

    func openHome() {
        currentURL = config.appURL.appending(path: "home")
    }

    func canOpen(_ url: URL) -> Bool {
        url.scheme == config.appURL.scheme && url.host == config.appURL.host
    }

    private func openLogin() {
        currentURL = config.appURL.appending(path: "login")
    }
}
