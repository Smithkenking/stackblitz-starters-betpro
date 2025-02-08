import { Injectable } from '@angular/core';

function getWindow():any {
    return window;
}

@Injectable({
    providedIn: 'root'
})
export class WindowReferenceService {
    get nativeWindow() {
        return getWindow();
    }
}