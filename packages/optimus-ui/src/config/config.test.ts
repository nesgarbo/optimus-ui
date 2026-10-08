import { TestBed } from '@angular/core/testing';
import { Optimus } from './optimus';

describe('Optimus translation', () => {
    it('should provide the English aria labels of the password toggle', () => {
        const aria = TestBed.runInInjectionContext(() => new Optimus()).getTranslation('aria');

        expect(aria.showPassword).toBe('Show password');
        expect(aria.hidePassword).toBe('Hide password');
    });
});
