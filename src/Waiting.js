import React from "react";

export const Context = React.createContext({
  increment() {},
  decrement() {}
});

export default class Waiting extends React.Component {
  state = {
    waiting: false
  };

  size = 0;

  increment() {
    this.setState(state => {
      this.size += 1;
      const waiting = this.size > 0;
      if (state.waiting === waiting) return null;
      return { waiting };
    });
  }

  decrement() {
    this.setState(state => {
      this.size -= 1;
      const waiting = this.size > 0;
      if (state.waiting === waiting) return null;
      return { waiting };
    });
  }

  render() {
    return (
      <Context.Provider value={this}>
        {this.props.children(this.state.waiting)}
      </Context.Provider>
    );
  }
}
