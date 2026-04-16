export function pingCommand() {
  return {
    type: 4,
    data: {
      content: "Pong from GitHub deploy",
    },
  };
}
