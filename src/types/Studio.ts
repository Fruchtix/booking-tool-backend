import Tattooer from './Tattooer';

export default interface Studio {
  studioID: string;
  studioUrl: string;
  tattooer: Tattooer[];
}
