import { graphql } from "@keystone-6/core";
import { virtual } from "@keystone-6/core/fields";
import path from 'path';

function resolveViewPath(viewPath) {
  return path.join(path.dirname(__dirname),'src/lib', viewPath);
}
export const PdfReportEDownload = virtual({
  field: graphql.field({
    type: graphql.JSON,
    async resolve(item: any, args, context) {
      const event = await context.query.Event.findOne({
        where: { id: item.id },
        query: `eventNo
        seller {
          name
        }
        eventType {
          name
        }
        eventCategory
        location {
          name
        }
        vehicles {
          id
          vehicleIndexNo
          loanAgreementNo
          clientContactPerson
          vehicleCondition
          make
          varient
          rcStatus
          registrationNumber
          yearOfManufacture
          mileage
          insuranceStatus
          yardLocation
          bidTimeExpire
          reservePrice
          startPrice
          repoDt
          state
        }`,
      });
      const rankLists = await Promise.all(
        event?.vehicles?.map((vehicle) => context.prisma.bid.findMany({
            distinct: ["userId"],
            where: { bidVehicle: { id: { equals: vehicle.id } } },
            orderBy: [
              {
                amount: "desc",
              },
              {
                createdAt: "asc",
              },
            ],
            skip: 0,
            take: 5,
            select: {
              user: {
                select: {
                  mobile: true,
                  firstName: true,
                  lastName: true,
                  pancardNo: true,
                },
              },
              amount: true,
            },
          })
        )
      );
      
      const vehicleRankReducer = (reducer,rank, i) => {
        if (i === 0)
          return {
            ...reducer,
            "1st Bidder Id": rank.user?.mobile,
            "1st Bidder Name": rank.user?.firstName + " " + rank.user?.lastName,
            "1st Bidder Contact No.": rank.user?.mobile,
            "1st Bidder Pan no": rank.user?.pancardNo,
            "1st Bidder Highest bid": rank.amount,
          };
        if(i===1)
        return {
          ...reducer,
          "2nd Bidder Id": rank.user?.mobile,
          "2nd Bidder Name": rank.user?.firstName + " " + rank.user?.lastName,
          "2nd Bidder Pan no": rank.user?.pancardNo,
          "2nd Bidder Highest bid": rank.amount,
        };
        if(i===2)
        return {
          ...reducer,
          "3rd Bidder Id": rank.user?.mobile,
          "3rd Bidder Name": rank.user?.firstName + " " + rank.user?.lastName,
          "3rd Bidder Pan no": rank.user?.pancardNo,
          "3rd Bidder Highest bid": rank.amount,
        };
        if(i===3)
        return {
          ...reducer,
          "4th Bidder Id": rank.user?.mobile,
          "4th Bidder Name": rank.user?.firstName + " " + rank.user?.lastName,
          "4th Bidder Pan no": rank.user?.pancardNo,
          "4th Bidder Highest bid": rank.amount,
        };
        return {
          ...reducer,
          "5th Bidder Id": rank.user?.mobile,
          "5th Bidder Name": rank.user?.firstName + " " + rank.user?.lastName,
          "5th Bidder Pan no": rank.user?.pancardNo,
          "5th Bidder Highest bid": rank.amount,
        };
      };
      return event.vehicles?.map((vehicle, i) => ({
        "S.No": i,
        "Auction Category/Leaf Name": `${event.eventNo}-${event.eventCategory}>>${event.location?.name}`,
        "AuctionList ID": `EVN${event.eventNo}-V${vehicle.vehicleIndexNo}`,
        ...vehicle,
        ...rankLists[i]?.reduce(vehicleRankReducer, {})
      }));
      // console.log(context?.session?.itemId);
    },
  }),
  ui: {
    views: resolveViewPath("./report-field-view.tsx"),
  },
});
