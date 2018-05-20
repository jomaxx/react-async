import React from "react";
import { render } from "react-testing-library";
import { SideEffect } from "@jomaxx/react-side-effect";
import { Async, Waiting } from "../";

beforeEach(() => {
  jest.restoreAllMocks();
});

test("resolves promise", () => {
  return new Promise(resolve => {
    render(
      <Async value={Promise.resolve(1)}>
        {value => (
          <SideEffect>
            {() => {
              expect(value).toBe(1);
              resolve();
            }}
          </SideEffect>
        )}
      </Async>
    );
  });
});

test("rejects promise", () => {
  return new Promise(resolve => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    class Catch extends React.Component {
      componentDidCatch(error) {
        expect(error).toBe(1);
        resolve();
      }

      render() {
        return this.props.children;
      }
    }

    render(
      <Catch>
        <Async value={Promise.reject(1)} />
      </Catch>
    );
  });
});

test("resolves non-promise values", () => {
  const spy = jest.fn(() => null);
  render(<Async value={1}>{spy}</Async>);
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith(1);
});

test("ignores previous promise", () => {
  return new Promise((resolve, reject) => {
    render(
      <Async value={Promise.resolve(1)}>
        {value => (
          <SideEffect>
            {() => {
              reject(new Error("error"));
            }}
          </SideEffect>
        )}
      </Async>
    ).rerender(
      <Async value={Promise.resolve(2)}>
        {value => (
          <SideEffect>
            {() => {
              expect(value).toBe(2);
              resolve();
            }}
          </SideEffect>
        )}
      </Async>
    );
  });
});

test("synchronous render if previously resolved", () => {
  const promise = Promise.resolve(1);

  return new Promise(resolve => {
    render(
      <Async value={promise}>{() => <SideEffect>{resolve}</SideEffect>}</Async>
    );
  }).then(() => {
    const spy = jest.fn(() => null);
    render(<Async value={promise}>{spy}</Async>);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
