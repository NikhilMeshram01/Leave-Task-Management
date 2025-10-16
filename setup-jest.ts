import "zone.js/dist/zone"; // Required by Angular
import "zone.js/dist/zone-testing";
import { TestBed } from "@angular/core/testing";
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from "@angular/platform-browser/testing";

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());

// Optional for Supabase
(global as any).Buffer = (global as any).Buffer || require("buffer").Buffer;
