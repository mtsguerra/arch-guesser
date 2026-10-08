package com.mtsguerra.archguesser.building;

/**
 * A technical drawing shown from the start of a round.
 *
 * @param src root-relative path served by the frontend
 */
public record Drawing(DrawingType type, String label, String src, String alt, String credit) {
}
