// Array backed ring buffer. Fixed size that allows infinite pushing while dropping old entries.
// Useful for something like a history feed where you only want to keep the last N items without
// allocating a new array on every push.

export class RingBuffer {
  buffer = [];
  modLen = 0;

  tail = 0;

  constructor(size) {
    if ((size & (size - 1)) !== 0) {
      // The reason for this is because we are using the bitwise & len-1 to calculate mod very efficiently
      // and it only works when len is a power of 2
      throw new Error("Size needs to be a power of 2");
    }
    this.buffer = new Array(size);
    this.modLen = size - 1;
  }

  itemAt(idx) {
    return this.buffer[idx & this.modLen];
  }

  pushBack(value) {
    // afaik this is fine in js:
    // the assumption is we won't get interrupted between these two statements and have some
    // other code run on the buffer inbetween
    this.buffer[this.tail & this.modLen] = value;
    this.tail = this.tail + 1;

    return this;
  }

  get(idx) {
    if (idx > this.tail - 1) {
      throw new Error(`only have ${this.tail} items`);
    }

    let head = this.head();
    if (idx < head) {
      throw new Error(`that entry has already been discarded`);
    }

    return this.itemAt(idx);
  }

  head() {
    if (this.tail == 0) {
      throw new Error("buffer is empty");
    }

    let head = this.tail - this.buffer.length;
    if (head < 0) {
      // the ring hasn't been filled yet so first item is 0
      return 0;
    }

    return head;
  }

  items() {
    let tail = this.tail;

    // Ring is empty
    if (tail == 0) {
      return [];
    }

    let head = this.head();
    let result = new Array(tail - head);

    let next = 0;
    for (let i = head; i < tail; i++) {
      result[next] = this.itemAt(i);
      next = next + 1;
    }

    return result;
  }

  [Symbol.iterator]() {
    let size = this.tail;
    if (size == 0) {
      return {
        next: function () {
          return {
            value: undefined,
            done: true,
          };
        },
      };
    }

    let items = this.buffer;
    let nextIdx = this.head();

    return {
      next: function () {
        let r = {
          value: items[nextIdx & (items.length - 1)],
          done: nextIdx >= size,
        };
        nextIdx = nextIdx + 1;

        return r;
      },
    };
  }
}
