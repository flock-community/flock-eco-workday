import React from "react";
import {render, screen, cleanup} from "@testing-library/react";
import '@testing-library/jest-dom';
import {createTestMultiDayFlockEvent, createTestOneDayFlockEvent} from "../../utils/tests/test-models";
import dayjs from "dayjs";
import {EventList} from "./EventList";

describe('FlockEventList', () => {
  afterEach(() => {
    cleanup();
  });

  const eventsList = [
    createTestOneDayFlockEvent(dayjs()),
    createTestMultiDayFlockEvent(dayjs(), dayjs().add(4, 'days'))
  ]

  let flockEventListElement;

  describe('should show empty state when there are no events', () => {
    render(<EventList events={eventsList}/>);
    flockEventListElement = screen.queryByTestId('flock-event-list');
    !expect(flockEventListElement).toBeInTheDocument();
  })

  describe('Show events in a list', () => {
    beforeEach(() => {
      render(<EventList events={eventsList}/>);
      flockEventListElement = screen.queryAllByTestId('flock-event-list');
    });

    it("renders without crashing", () => {
      expect(flockEventListElement[0]).toBeInTheDocument();
    });
  });

});
