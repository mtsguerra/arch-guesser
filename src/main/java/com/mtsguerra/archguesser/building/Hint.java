package com.mtsguerra.archguesser.building;

/**
 * A progressive hint. {@link HintType#IMAGE} hints carry {@code image}
 * (and optionally {@code caption}); {@link HintType#FACT} hints carry {@code text}.
 *
 * @param order 1-based position in the reveal sequence
 */
public record Hint(int order, HintType type, Media image, String caption, String text) {
}
