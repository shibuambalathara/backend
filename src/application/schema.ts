import { User } from '../entities/users'
import { Event } from '../entities/events'
import { EventType } from '../entities/event-types'
import { EventCategory } from '../entities/event-categories'
import { Location } from '../entities/locations'
import { Vehicle } from '../entities/vehicles'
//import { Bid } from '../entities/bids'
import { EventUser } from "../entities/event-users"
import { ExcelUpload } from '../entities/excel-upload'
import { Seller } from '../entities/sellers'
import { BidCountUpdate } from "../entities/bid-count-updates";
import { Bid } from "../entities/bids";
import { UserBid } from "../entities/user-bids";
// import { Role } from "../entities/roles";
export { router } from "./restRoutes";
export { extendGraphqlSchema } from "./graphqlRoutes";
export const lists = {
  User,
  Event,
  EventType,
  Location,
  EventCategory,
  Vehicle,
  EventUser,
  ExcelUpload,
  Seller,
  BidCountUpdate,
  Bid,
  UserBid,
  // Role,
};