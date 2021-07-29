import 'dart:math';

void main() {
  print(sequence(0, (i) => i + 1).take(10));
  print(naturals.take(5));
  print(primes.takeWhile((p) => p < 100));
}

Iterable<T> sequence<T>(T seed, T next(T current)) sync* {
  for (var current = seed;; current = next(current)) yield current;
}

Iterable<int> get naturals => sequence(0, (i) => i + 1);

bool isPrime(int p) => naturals
    .where((n) => n > 1)
    .takeWhile((n) => pow(n, 2) <= p)
    .every((n) => p % n != 0);

Iterable<int> get primes => naturals

    .where(isPrime);
