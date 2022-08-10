export default interface Booking {
  tattooerID: string;
  studioID: string;
  userName: string;
  userSurname: string;
  email: string;
  age: number;
  tattooDescription: string;
  tattooPosition: string;
  tattooSize: string;
  alreadyCustomer: boolean;
  instaName: string;
  messages?: [];
}
