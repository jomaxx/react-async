import React from "react";
import { render } from "react-testing-library";
import { SideEffect } from "@jomaxx/react-side-effect";
import { Async, Waiting } from "../";

test("waits for Async components to resolve", () => {
  return new Promise(resolve => {
    const promiseA = Promise.resolve(1);
    const promiseB = Promise.resolve(2);
    const promiseC = Promise.resolve(3);

    const spy = jest.fn(waiting => (
      <React.Fragment>
        {waiting && (
          <SideEffect>
            {() => () => {
              expect(spy.mock.calls).toEqual([
                [false], // intitial render
                [true], // promiseA and promise B
                [true], // promiseC
                [false] // all resolved
              ]);

              resolve();
            }}
          </SideEffect>
        )}
        <Async value={promiseA} />
        <Async value={promiseB}>{() => <Async value={promiseC} />}</Async>
      </React.Fragment>
    ));

    render(<Waiting>{spy}</Waiting>);
  });
});
