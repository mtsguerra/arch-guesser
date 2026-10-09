package com.mtsguerra.archguesser.building;

/**
 * A progressive, text-only hint. Images live on the board as tabs from the start.
 *
 * @param order 1-based position in the reveal sequence
 */
public record Hint(int order, String text) {
}
