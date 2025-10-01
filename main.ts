#!/usr/bin/env -S deno serve --allow-net=ghcr.io

export default {
  async fetch(request) {
    return new Response("Hello, World!");
  }
};
