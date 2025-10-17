import "zone.js";
import "zone.js/testing";
import { TestBed } from "@angular/core/testing";
import { BrowserModule } from "@angular/platform-browser";

// Simple test environment setup
TestBed.initTestEnvironment(BrowserModule, {
  platform: () =>
    ({
      injector: {
        get: () => ({}),
      },
    } as any),
} as any);
