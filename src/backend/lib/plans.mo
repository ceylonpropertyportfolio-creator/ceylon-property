import Map "mo:core/Map";
import Result "mo:core/Result";
import Types "../types/common";
import CustomersTypes "../types/customers";

module {
  /// Orders two plans by `sortOrder`, then by id for a stable tie-break.
  func comparePlans(a : CustomersTypes.Plan, b : CustomersTypes.Plan) : { #less; #equal; #greater } {
    if (a.sortOrder < b.sortOrder) { #less }
    else if (a.sortOrder > b.sortOrder) { #greater }
    else if (a.id < b.id) { #less }
    else if (a.id > b.id) { #greater }
    else { #equal };
  };

  /// Returns every plan, active or not, ordered by `sortOrder`.
  public func listAll(
    plans : Map.Map<Types.PlanId, CustomersTypes.Plan>,
  ) : [CustomersTypes.Plan] {
    plans.values().toArray().sort(comparePlans);
  };

  /// Returns every active plan, ordered by `sortOrder`.
  public func listActive(
    plans : Map.Map<Types.PlanId, CustomersTypes.Plan>,
  ) : [CustomersTypes.Plan] {
    plans.values().toArray().filter(func p = p.active).sort(comparePlans);
  };

  /// Returns a single plan, or `null` when it does not exist.
  public func get(
    plans : Map.Map<Types.PlanId, CustomersTypes.Plan>,
    id : Types.PlanId,
  ) : ?CustomersTypes.Plan {
    plans.get(id);
  };

  /// Creates a plan. Admin only.
  public func create(
    state : CustomersTypes.CustomersState,
    plans : Map.Map<Types.PlanId, CustomersTypes.Plan>,
    input : CustomersTypes.PlanInput,
  ) : CustomersTypes.Plan {
    let id = state.nextPlanId;
    state.nextPlanId := id + 1;
    let plan : CustomersTypes.Plan = {
      id;
      name = input.name;
      price = input.price;
      billingPeriod = input.billingPeriod;
      listingAllowance = input.listingAllowance;
      imageAllowance = input.imageAllowance;
      features = input.features;
      active = input.active;
      sortOrder = input.sortOrder;
    };
    plans.add(id, plan);
    plan;
  };

  /// Applies a full edit to a plan. Admin only.
  public func update(
    plans : Map.Map<Types.PlanId, CustomersTypes.Plan>,
    id : Types.PlanId,
    input : CustomersTypes.PlanInput,
  ) : Result.Result<CustomersTypes.Plan, CustomersTypes.PaymentError> {
    switch (plans.get(id)) {
      case null { #err(#planNotFound(id)) };
      case (?existing) {
        let updated : CustomersTypes.Plan = {
          id;
          name = input.name;
          price = input.price;
          billingPeriod = input.billingPeriod;
          listingAllowance = input.listingAllowance;
          imageAllowance = input.imageAllowance;
          features = input.features;
          active = input.active;
          sortOrder = input.sortOrder;
        };
        plans.add(id, updated);
        #ok(updated);
      };
    };
  };

  /// Deletes a plan. Admin only.
  public func remove(
    plans : Map.Map<Types.PlanId, CustomersTypes.Plan>,
    id : Types.PlanId,
  ) : Result.Result<(), CustomersTypes.PaymentError> {
    switch (plans.get(id)) {
      case null { #err(#planNotFound(id)) };
      case (?_) {
        plans.remove(id);
        #ok(());
      };
    };
  };
};
