export default interface Timeslot {
  timeslotID: string;
  tattooerID: string;
  studioID: string;
  start: string;
  end: string;
  seriesID?: string;
  repeats?: boolean;
  repeatingStartDate?: string;
  repeatingEnd?: string;
  repeatingDays?: number[];
  ttl?: number;
}
