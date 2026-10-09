package com.mtsguerra.archguesser.building;

/**
 * A technical drawing shown from the start of a round.
 *
 * @param src    image URL, or null when no free drawing exists (the client shows a placeholder)
 * @param crop   optional region of the image to show
 * @param source optional page the image comes from (e.g. its Wikimedia Commons file page)
 */
public record Drawing(DrawingType type, String label, String src, Crop crop, String alt, String credit, String source) {
}
