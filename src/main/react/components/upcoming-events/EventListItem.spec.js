import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EventListItem } from "./EventListItem";
import {
  createTestMultiDayFlockEvent,
  createTestOneDayFlockEvent,
} from "../../utils/tests/test-models";
import dayjs from "dayjs";

describe("FlockEventListItem", () => {
  afterEach(() => {
    cleanup();
  });

  let flockEventListItemElement;

  describe("Single day event", () => {
    beforeEach(() => {
      render(<EventListItem event={createTestOneDayFlockEvent(dayjs())} />);
      flockEventListItemElement = screen.queryByTestId("flock-event-list-item");
    });

    it("renders without crashing", () => {
      expect(flockEventListItemElement).toBeInTheDocument();
    });

    it("should show date for single day date event", () => {
      expect(flockEventListItemElement).toContainHTML("date:");
    });
  });

  describe("Multi day event", () => {
    beforeEach(() => {
      render(
        <EventListItem
          event={createTestMultiDayFlockEvent(dayjs(), dayjs().add(2, "days"))}
        />
      );
      flockEventListItemElement = screen.queryByTestId("flock-event-list-item");
    });

    it("renders without crashing", () => {
      expect(flockEventListItemElement).toBeInTheDocument();
    });

    it("should show from/to for multi day date event", () => {
      expect(flockEventListItemElement).not.toContainHTML("date:");
      expect(flockEventListItemElement).toContainHTML("from:");
      expect(flockEventListItemElement).toContainHTML("to:");
    });
  });
});
