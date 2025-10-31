import { Injectable } from "@nestjs/common";
import { CreateRentalDto } from "./dto/createRental.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Rental } from "src/models/rental.schema";
import { Model } from "mongoose";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { NotFoundException } from "src/common/exceptions/not-found.exception";
import { FacetResult, RentalAggregateResult, ReturnRentalMapping } from "src/common/utils/type";
import { RentalPaginationDto } from "src/common/pagination/dto/rental/rental-pagination";
import { applyCommonFiltersMongo } from "src/common/pagination/applyCommonFilters";
import { RentalFieldMapping } from "src/common/pagination/filters/rental-field-mapping";
import { applySortingMongo } from "src/common/pagination/applySorting";
import { applyPaginationMongo } from "src/common/pagination/applyPagination";
import { applyFacetMongo } from "src/common/pagination/applyFacetMongo";
import { UpdateRentalDto } from "./dto/updateRental.dto";
import { ChangeStatusDto } from "./dto/changeStatus.dto";
import { ResponseMsg } from "src/common/response/response-message";
import { buildPaginationResponse } from "src/common/pagination/pagination-response";
import { ResponseList } from "src/common/response/response-list";

@Injectable()
export class RentalService {
  constructor(@InjectModel(Rental.name) private readonly rentalRepository: Model<Rental>) {}
  async create(createRentalDto: CreateRentalDto): Promise<void> {
    const createdRental = new this.rentalRepository(createRentalDto);
    await createdRental.save();
  }

  async getAllRentals(filter: RentalPaginationDto): Promise<ResponseList<ReturnRentalMapping>> {
    const pipeline: any[] = [];
    pipeline.push(
      // --- Join Booking ---
      {
        $lookup: {
          from: "bookings",
          localField: "booking_id",
          foreignField: "_id",
          as: "booking",
          pipeline: [
            // --- Join Renter ---
            {
              $lookup: {
                from: "renters",
                localField: "renter_id",
                foreignField: "_id",
                as: "renter",
                pipeline: [
                  {
                    $lookup: {
                      from: "users",
                      localField: "user_id",
                      foreignField: "_id",
                      as: "user",
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            full_name: 1,
                            email: 1,
                            phone: 1,
                          },
                        },
                      ],
                    },
                  },
                  { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                  {
                    $project: {
                      _id: 1,
                      address: 1,
                      date_of_birth: 1,
                      user: 1,
                    },
                  },
                ],
              },
            },
            { $unwind: { path: "$renter", preserveNullAndEmptyArrays: true } },

            // --- Join VehicleAtStation ---
            {
              $lookup: {
                from: "vehicle_at_stations",
                localField: "vehicle_at_station_id",
                foreignField: "_id",
                as: "vehicle_at_station",
                pipeline: [
                  {
                    $lookup: {
                      from: "vehicles",
                      localField: "vehicle_id",
                      foreignField: "_id",
                      as: "vehicle",
                    },
                  },
                  { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } },
                  {
                    $lookup: {
                      from: "stations",
                      localField: "station_id",
                      foreignField: "_id",
                      as: "station",
                    },
                  },
                  { $unwind: { path: "$station", preserveNullAndEmptyArrays: true } },
                  {
                    $project: {
                      _id: 1,
                      vehicle: {
                        _id: 1,
                        name: 1,
                        license_plate: 1,
                      },
                      station: {
                        _id: 1,
                        name: 1,
                      },
                    },
                  },
                ],
              },
            },
            { $unwind: { path: "$vehicle_at_station", preserveNullAndEmptyArrays: true } },

            // --- Join Verified Staff ---
            {
              $lookup: {
                from: "staffs",
                localField: "verified_by_staff_id",
                foreignField: "_id",
                as: "verified_staff",
                pipeline: [
                  {
                    $lookup: {
                      from: "users",
                      localField: "user_id",
                      foreignField: "_id",
                      as: "user",
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            full_name: 1,
                            email: 1,
                            phone: 1,
                          },
                        },
                      ],
                    },
                  },
                  { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                  {
                    $project: {
                      _id: 1,
                      employee_code: 1,
                      position: 1,
                      user: 1,
                    },
                  },
                ],
              },
            },
            { $unwind: { path: "$verified_staff", preserveNullAndEmptyArrays: true } },

            // --- Project booking fields ---
            {
              $project: {
                _id: 1,
                rental_start_datetime: 1,
                expected_return_datetime: 1,
                status: 1,
                verification_status: 1,
                total_booking_fee_amount: 1,
                deposit_fee_amount: 1,
                rental_fee_amount: 1,
                verified_at: 1,
                renter: 1,
                verified_staff: 1,
                vehicle_at_station: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$booking", preserveNullAndEmptyArrays: true } },

      // --- Join Inspections ---
      {
        $lookup: {
          from: "inspections",
          localField: "_id",
          foreignField: "rental_id",
          as: "inspections",
          pipeline: [
            {
              $lookup: {
                from: "staffs",
                localField: "inspector_staff_id",
                foreignField: "_id",
                as: "inspector",
                pipeline: [
                  {
                    $lookup: {
                      from: "users",
                      localField: "user_id",
                      foreignField: "_id",
                      as: "user",
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            full_name: 1,
                            email: 1,
                            phone: 1,
                          },
                        },
                      ],
                    },
                  },
                  { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                  {
                    $project: {
                      _id: 1,
                      employee_code: 1,
                      position: 1,
                      user: 1,
                    },
                  },
                ],
              },
            },
            { $unwind: { path: "$inspector", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "reports_photo",
                localField: "_id",
                foreignField: "inspection_id",
                as: "report_photos",
                pipeline: [{ $project: { _id: 1, url: 1, label: 1 } }],
              },
            },
            {
              $project: {
                _id: 1,
                type: 1,
                inspected_at: 1,
                current_battery_capacity_kwh: 1,
                current_mileage: 1,
                inspector: 1,
                report_photos: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicle_id",
          foreignField: "_id",
          as: "vehicle",
          pipeline: [{ $project: { _id: 1, name: 1, license_plate: 1 } }],
        },
      },
      { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } },

      // --- Join Contracts ---
      {
        $lookup: {
          from: "contracts",
          localField: "_id", // _id của rental
          foreignField: "rental_id",
          as: "contract",
          pipeline: [
            {
              $project: {
                _id: 1,
                rental_id: 1,
                document_url: 1,
                completed_at: 1,
                created_at: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$contract", preserveNullAndEmptyArrays: true } },
    );
    applyCommonFiltersMongo(pipeline, filter, RentalFieldMapping);
    const allowedSortFields = [
      "created_at",
      "pickup_datetime",
      "booking.rental_start_datetime",
      "booking.expected_return_datetime",
      "booking_total_booking_fee_amount",
    ];
    applySortingMongo(pipeline, filter.sortBy, filter.sortOrder, allowedSortFields, "created_at");
    applyPaginationMongo(pipeline, { page: filter.page, take: filter.take });
    applyFacetMongo(pipeline);

    const result = (await this.rentalRepository.aggregate(pipeline)) as FacetResult<RentalAggregateResult>;
    const data = result[0]?.data || [];
    const mappedResult = data.map((rental) => this.ReturnRentalMapping(rental));
    const total = result[0]?.meta?.[0]?.total || 0;
    return ResponseList.ok(buildPaginationResponse(mappedResult, { total, page: filter.page, take: filter.take }));
  }
  async getRentalById(id: string): Promise<ResponseDetail<ReturnRentalMapping>> {
    const pipeline: any[] = [];
    pipeline.push(
      // --- Join Booking ---
      {
        $lookup: {
          from: "bookings",
          localField: "booking_id",
          foreignField: "_id",
          as: "booking",
          pipeline: [
            // --- Join Renter ---
            {
              $lookup: {
                from: "renters",
                localField: "renter_id",
                foreignField: "_id",
                as: "renter",
                pipeline: [
                  {
                    $lookup: {
                      from: "users",
                      localField: "user_id",
                      foreignField: "_id",
                      as: "user",
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            full_name: 1,
                            email: 1,
                            phone: 1,
                          },
                        },
                      ],
                    },
                  },
                  { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                  {
                    $project: {
                      _id: 1,
                      address: 1,
                      date_of_birth: 1,
                      user: 1,
                    },
                  },
                ],
              },
            },
            { $unwind: { path: "$renter", preserveNullAndEmptyArrays: true } },

            // --- Join VehicleAtStation ---
            {
              $lookup: {
                from: "vehicle_at_stations",
                localField: "vehicle_at_station_id",
                foreignField: "_id",
                as: "vehicle_at_station",
                pipeline: [
                  {
                    $lookup: {
                      from: "vehicles",
                      localField: "vehicle_id",
                      foreignField: "_id",
                      as: "vehicle",
                    },
                  },
                  { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } },
                  {
                    $lookup: {
                      from: "stations",
                      localField: "station_id",
                      foreignField: "_id",
                      as: "station",
                    },
                  },
                  { $unwind: { path: "$station", preserveNullAndEmptyArrays: true } },
                  {
                    $project: {
                      _id: 1,
                      vehicle: {
                        _id: 1,
                        name: 1,
                        license_plate: 1,
                      },
                      station: {
                        _id: 1,
                        name: 1,
                      },
                    },
                  },
                ],
              },
            },
            { $unwind: { path: "$vehicle_at_station", preserveNullAndEmptyArrays: true } },

            // --- Join Verified Staff ---
            {
              $lookup: {
                from: "staffs",
                localField: "verified_by_staff_id",
                foreignField: "_id",
                as: "verified_staff",
                pipeline: [
                  {
                    $lookup: {
                      from: "users",
                      localField: "user_id",
                      foreignField: "_id",
                      as: "user",
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            full_name: 1,
                            email: 1,
                            phone: 1,
                          },
                        },
                      ],
                    },
                  },
                  { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                  {
                    $project: {
                      _id: 1,
                      employee_code: 1,
                      position: 1,
                      user: 1,
                    },
                  },
                ],
              },
            },
            { $unwind: { path: "$verified_staff", preserveNullAndEmptyArrays: true } },

            // --- Project booking fields ---
            {
              $project: {
                _id: 1,
                rental_start_datetime: 1,
                expected_return_datetime: 1,
                status: 1,
                verification_status: 1,
                total_booking_fee_amount: 1,
                deposit_fee_amount: 1,
                rental_fee_amount: 1,
                verified_at: 1,
                renter: 1,
                verified_staff: 1,
                vehicle_at_station: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$booking", preserveNullAndEmptyArrays: true } },

      // --- Join Inspections ---
      {
        $lookup: {
          from: "inspections",
          localField: "_id",
          foreignField: "rental_id",
          as: "inspections",
          pipeline: [
            {
              $lookup: {
                from: "staffs",
                localField: "inspector_staff_id",
                foreignField: "_id",
                as: "inspector",
                pipeline: [
                  {
                    $lookup: {
                      from: "users",
                      localField: "user_id",
                      foreignField: "_id",
                      as: "user",
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            full_name: 1,
                            email: 1,
                            phone: 1,
                          },
                        },
                      ],
                    },
                  },
                  { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                  {
                    $project: {
                      _id: 1,
                      employee_code: 1,
                      position: 1,
                      user: 1,
                    },
                  },
                ],
              },
            },
            { $unwind: { path: "$inspector", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "reports_photo",
                localField: "_id",
                foreignField: "inspection_id",
                as: "report_photos",
                pipeline: [{ $project: { _id: 1, url: 1, label: 1 } }],
              },
            },
            {
              $project: {
                _id: 1,
                type: 1,
                inspected_at: 1,
                current_battery_capacity_kwh: 1,
                current_mileage: 1,
                inspector: 1,
                report_photos: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicle_id",
          foreignField: "_id",
          as: "vehicle",
          pipeline: [{ $project: { _id: 1, name: 1, license_plate: 1 } }],
        },
      },
      { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } },

      // --- Join Contracts ---
      {
        $lookup: {
          from: "contracts",
          localField: "_id", // _id của rental
          foreignField: "rental_id",
          as: "contract",
          pipeline: [
            {
              $project: {
                _id: 1,
                rental_id: 1,
                document_url: 1,
                completed_at: 1,
                created_at: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$contract", preserveNullAndEmptyArrays: true } },
    );
    const result = await this.rentalRepository.aggregate(pipeline);
    const rental = result[0] as RentalAggregateResult;
    if (!rental) {
      throw new NotFoundException(`Rental with id ${id} not found`);
    }
    const mappedResult = this.ReturnRentalMapping(rental);
    return ResponseDetail.ok(mappedResult);
  }
  private ReturnRentalMapping(data: RentalAggregateResult): ReturnRentalMapping {
    return {
      _id: data._id,
      pickup_datetime: data.pickup_datetime,
      status: data.status,
      created_at: data.created_at,

      booking: {
        _id: data.booking._id,
        rental_start_datetime: data.booking.rental_start_datetime,
        expected_return_datetime: data.booking.expected_return_datetime,
        status: data.booking.status,
        verification_status: data.booking.verification_status,
        total_booking_fee_amount: data.booking.total_booking_fee_amount,
        deposit_fee_amount: data.booking.deposit_fee_amount,
        rental_fee_amount: data.booking.rental_fee_amount,
        verified_at: data.booking.verified_at,

        renter: {
          _id: data.booking.renter._id,
          address: data.booking.renter.address,
          date_of_birth: data.booking.renter.date_of_birth,
          user: {
            _id: data.booking.renter.user._id,
            email: data.booking.renter.user.email,
            full_name: data.booking.renter.user.full_name,
          },
        },

        verified_staff: data.booking.verified_staff
          ? {
              _id: data.booking.verified_staff._id,
              employee_code: data.booking.verified_staff.employee_code,
              position: data.booking.verified_staff.position,
              user: {
                _id: data.booking.verified_staff.user._id,
                email: data.booking.verified_staff.user.email,
                full_name: data.booking.verified_staff.user.full_name,
              },
            }
          : null,
      },

      inspections:
        data.inspections?.map((inspection) => ({
          _id: inspection._id,
          type: inspection.type,
          inspected_at: inspection.inspected_at,
          current_battery_capacity_kwh: inspection.current_battery_capacity_kwh,
          current_mileage: inspection.current_mileage,

          inspector: inspection.inspector
            ? {
                _id: inspection.inspector._id,
                employee_code: inspection.inspector.employee_code,
                position: inspection.inspector.position,
                user: {
                  _id: inspection.inspector.user._id,
                  email: inspection.inspector.user.email,
                  full_name: inspection.inspector.user.full_name,
                },
              }
            : null,

          report_photos:
            inspection.report_photos?.map((photo) => ({
              _id: photo._id,
              url: photo.url,
              label: photo.label,
            })) || [],
        })) || [],
      contract: data.contract
        ? {
            _id: data.contract._id,
            document_url: data.contract.document_url,
          }
        : null,
    };
  }

  async update(id: string, updateRentalDto: UpdateRentalDto): Promise<ResponseDetail<Rental>> {
    const updatedRental = await this.rentalRepository.findByIdAndUpdate(id, updateRentalDto, { new: true }).exec();
    if (!updatedRental) {
      throw new NotFoundException(`Rental with id ${id} not found`);
    }
    return ResponseDetail.ok(updatedRental);
  }

  async changeStatus(id: string, changeStatus: ChangeStatusDto): Promise<ResponseMsg> {
    const updatedRental = await this.rentalRepository.findByIdAndUpdate(id, { status: changeStatus.status }, { new: true }).exec();
    if (!updatedRental) {
      throw new NotFoundException(`Rental with id ${id} not found`);
    }
    return ResponseMsg.ok("Rental status updated successfully");
  }

  async delete(id: string): Promise<ResponseMsg> {
    const deletedRental = await this.rentalRepository.findByIdAndDelete(id).exec();
    if (!deletedRental) {
      throw new NotFoundException(`Rental with id ${id} not found`);
    }
    return ResponseMsg.ok("Rental deleted successfully");
  }
}
