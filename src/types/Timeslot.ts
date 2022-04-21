export default interface Timeslot {
  timeslotID: string;
  tattooerID: string;
  studioID: string;
  start: string;
  end: string;
  repeats?: boolean;
  repeatingEnd?: string;
  repeatingDays?: number[];
}
