Iterable<T> sequence<T>(T seed, T Function(T t) next) sync* {
  yield seed;
  while (true) yield seed = next(seed);
}

Iterable<int> get naturals => sequence(0, (i) => i + 1);
