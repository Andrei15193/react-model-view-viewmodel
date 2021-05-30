import { JSDOM } from 'jsdom';

global.window = new JSDOM('<!DOCTYPE !html><html><head></head><body></body></html>').window;
global.document = global.window.document;
global.navigator = { userAgent: 'node.js' } as Navigator;