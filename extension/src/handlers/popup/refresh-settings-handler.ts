import {
    Command,
    ExtensionToAsbPlayerCommand,
    ExtensionToVideoCommand,
    Message,
    SettingsUpdatedMessage,
} from '@project/common';
import TabRegistry from '../../services/tab-registry';

export default class RefreshSettingsHandler {
    private readonly tabRegistry: TabRegistry;

    constructor(tabRegistry: TabRegistry) {
        this.tabRegistry = tabRegistry;
    }

    get sender() {
        return ['asbplayer-popup', 'asbplayer-settings'];
    }

    get command() {
        return 'settings-updated';
    }

    handle(command: Command<Message>, sender: chrome.runtime.MessageSender) {
        this.tabRegistry.publishCommandToVideoElements((videoElement) => {
            const settingsUpdatedCommand: ExtensionToVideoCommand<SettingsUpdatedMessage> = {
                sender: 'asbplayer-extension-to-video',
                message: {
                    command: 'settings-updated',
                },
                src: videoElement.src,
            };
            return settingsUpdatedCommand;
        });
        this.tabRegistry.publishCommandToAsbplayers({
            commandFactory: () => {
                const settingsUpdatedCommand: ExtensionToAsbPlayerCommand<SettingsUpdatedMessage> = {
                    sender: 'asbplayer-extension-to-player',
                    message: {
                        command: 'settings-updated',
                    },
                };
                return settingsUpdatedCommand;
            },
        });
        return false;
    }
}
