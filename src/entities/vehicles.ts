import {
  checkbox,
  float,
  integer,
      relationship,
      select,
      text,
      timestamp,
    } from "@keystone-6/core/fields";
    import { list } from "@keystone-6/core";
    import {
      fieldOptions,
      isAdminCreate,
      isAdminEdit,
      isSignedIn,
      isSuperAdmin,
    } from "../application/access";

    const ownerFilter = ({ session, context, listKey, operation }) => {
      if (session.data.role === "admin") {
        return true;
      }
      return {
        event: {
          id: { in: session.data?.userEvents?.map((e) => e.event.id) },
        },
      };
    };

    export const Vehicle = list({
      access: {
        operation: {
          query: isSignedIn,
          create: isSuperAdmin,
          update: isSuperAdmin,
          delete: isSuperAdmin,
        },
        filter: {
          query: ownerFilter,
        },
      },
      ui: {
        labelField: "registrationNumber",
        hideCreate: ({ session }) => !!session.itemId || !isSuperAdmin(session),
        hideDelete: ({ session }) => !!session.itemId || !isSuperAdmin(session),
        itemView: { defaultFieldMode: isAdminEdit },
        createView: { defaultFieldMode: isAdminCreate },
      },
      fields: {
        registrationNumber: text({
          validation: {
            isRequired: true,
          },
          isIndexed: true,
        }),
        loanAgreementNo: text({
          validation: {
            isRequired: true,
          },
        }),
        registeredOwnerName: text({}),
        make: text(),
        model: text(),
        varient: text(),
        categoty: text(),
        fuel: select({
          type: "enum",
          options: ["diesel", "petrol", "cng", "lpg", "electric"],
        }),
        type: text({}),
        rcStatus: text({}),
        yearOfManufacture: integer({}),
        ownership: integer(),
        kmReading: integer(),
        insuranceStatus: text(),
        yardLocation: text(),
        startPrice: float(),
        reservePrice: float(),
        repoDt: integer(),
        veicleLocation: text(),
        vehicleRemarks: text(),
        auctionManager: text(),
        actionManager: text(),
        sellerName: text(),
        parkingCharges: text({}),
        insurance: text(),
        insuranceValidTill: text(),
        tax: text(),
        fitness: text(),
        permit: text(),
        fitnessPermit: text({}),
        engineNo: text({}),
        chassisNo: text(),
        frontImage: text(),
        backImage: text(),
        leftImage: text({}),
        rightImage: text(),
        image5: text({}),
        image6: text({}),
        image7: text(),
        image8: text(),
        image9: text(),
        image10: text(),
        image11: text(),
        image12: text(),

        event: relationship({
          ref: "Event.vehicles",
          many: false,
          ui: {
            createView: { fieldMode: "hidden" },
            itemView: { fieldMode: "read" },
          },
        }),
        ExcelFile: relationship({
          ref: "ExcelUpload.vehicles",
          many: false,
          ui: {
            createView: { fieldMode: "hidden" },
            itemView: { fieldMode: "read" },
          },
        }),
        bids: relationship({
          ref: "Bid.vehicle",
          many: true,
        }),

        createdAt: timestamp({
          ...fieldOptions,
          defaultValue: { kind: "now" },
        }),
        updatedAt: timestamp({ ...fieldOptions, db: { updatedAt: true } }),
      },
    });