import React from "react";
import { SideEffect } from "@jomaxx/react-side-effect";
import { Context } from "./Waiting";

const cache = new WeakMap();

export default class Async extends React.Component {
  static getDerivedStateFromProps(props) {
    if (!props.value || typeof props.value.then !== "function") {
      return {
        status: 1,
        promise: undefined,
        value: props.value,
        error: undefined
      };
    }

    if (cache.has(props.value)) {
      return cache.get(props.value);
    }

    const state = {
      status: 0,
      promise: undefined,
      value: undefined,
      error: undefined
    };

    state.promise = props.value.then(
      value => {
        state.status = 1;
        state.promise = undefined;
        state.value = value;
      },
      error => {
        state.status = 2;
        state.promise = undefined;
        state.error = error;
      }
    );

    cache.set(props.value, state);

    return state;
  }

  static defaultProps = {
    children: () => null
  };

  state = {
    status: 0,
    promise: undefined,
    value: undefined,
    error: undefined
  };

  componentDidMount() {
    let subscribed = true;

    this.componentWillUnmount = () => {
      subscribed = false;
    };

    if (this.state.status > 0) {
      return;
    }

    this.state.promise.then(() => {
      if (subscribed) {
        this.setState(Async.getDerivedStateFromProps.bind(null, this.props));
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.promise === prevState.promise) return;
    this.componentWillUnmount();
    this.componentDidMount();
  }

  render() {
    switch (this.state.status) {
      case 0:
        return (
          <Context.Consumer>
            {context => (
              <SideEffect>
                {() => {
                  context.increment();
                  return () => context.decrement();
                }}
              </SideEffect>
            )}
          </Context.Consumer>
        );
      case 1:
        return this.props.children(this.state.value);
      case 2:
      default:
        throw this.state.error;
    }
  }
}
