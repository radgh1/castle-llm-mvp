function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

function memoizedFibonacci(n, memo = {}) {
    if (n in memo) return memo[n];
    if (n <= 1) return n;
    return memo[n] = memoizedFibonacci(n - 1, memo) + memoizedFibonacci(n - 2, memo);
}