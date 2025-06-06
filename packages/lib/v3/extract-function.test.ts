import { describe, it, expect } from 'vitest';
import { extractFunction } from './extract-function';

describe('extractFunction', () => {
    it('should extract a named function', () => {
        const code = `
function myFunction() {
    return "hello";
}`;
        const expected = `function myFunction() {
    return "hello";
}`;
        expect(extractFunction(code, 'myFunction')).toBe(expected);
    });

    it('should extract an async function', () => {
        const code = `
async function myAsyncFunction() {
    return Promise.resolve("hello");
}`;
        const expected = `async function myAsyncFunction() {
    return Promise.resolve("hello");
}`;
        expect(extractFunction(code, 'myAsyncFunction')).toBe(expected);
    });

    it('should extract an exported named function', () => {
        const code = `
export function myExportedFunction() {
    return "exported";
}`;
        const expected = `function myExportedFunction() {
    return "exported";
}`;
        expect(extractFunction(code, 'myExportedFunction')).toBe(expected);
    });

    it('should extract an exported async function', () => {
        const code = `
export async function myExportedAsyncFunction() {
    return Promise.resolve("exported async");
}`;
        const expected = `async function myExportedAsyncFunction() {
    return Promise.resolve("exported async");
}`;
        expect(extractFunction(code, 'myExportedAsyncFunction')).toBe(expected);
    });

    it('should return null if the function is not found', () => {
        const code = `
function anotherFunction() {
    return "world";
}`;
        expect(extractFunction(code, 'nonExistentFunction')).toBe(null);
    });

    it('should handle complex code with multiple functions', () => {
        const code = `
import React from 'react';

function helper() {
    return "I am a helper";
}

export async function getServerSideProps(context) {
  const data = await fetch('some-api');
  return { props: { data } };
}

const MyComponent = () => <div>Hello</div>;

export default MyComponent;
`;
        const expected = `async function getServerSideProps(context) {
  const data = await fetch('some-api');
  return { props: { data } };
}`;
        expect(extractFunction(code, 'getServerSideProps')).toBe(expected.trim());
    });

    it('should not extract a function call', () => {
        const code = `
myFunction();

function anotherFunction() {
    return "world";
}
`;
        expect(extractFunction(code, 'myFunction')).toBe(null);
    });

    it('should not extract a variable with the same name as the function', () => {
        const code = `
const myFunction = "not a function";

function anotherFunction() {
    return "world";
}
`;
        expect(extractFunction(code, 'myFunction')).toBe(null);
    });
}); 