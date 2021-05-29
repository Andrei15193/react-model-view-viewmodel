import { JSDOM } from 'jsdom';

global.window = new JSDOM('<!DOCTYPE !html><html><head></head><body></body></html>').window as any;
global.document = global.window.document;