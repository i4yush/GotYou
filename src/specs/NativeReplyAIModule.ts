import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  showOverlay(suggestions: string[]): void;
  hideOverlay(): void;
  startNotificationService(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeReplyAIModule');
