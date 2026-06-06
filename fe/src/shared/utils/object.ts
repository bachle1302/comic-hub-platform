export function areShallowObjectsEqual(left: object, right: object): boolean {
  const leftEntries = Object.entries(left);
  const rightEntries = Object.entries(right);
  const rightRecord = right as Record<string, unknown>;

  if (leftEntries.length !== rightEntries.length) {
    return false;
  }

  return leftEntries.every(([key, value]) => {
    return (
      Object.prototype.hasOwnProperty.call(right, key) &&
      rightRecord[key] === value
    );
  });
}
