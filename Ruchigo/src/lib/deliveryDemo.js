import { positionOnRoute } from "./tracking.js";

// Development-only fixture. Road geometry from the public OSRM service, based
// on OpenStreetMap, retrieved 22 Sep 2026. These are NOT customer locations.
// Inner Circle -> Hailey Road, New Delhi. Retained locally so the demo does not
// repeatedly call a public routing service. No road/traffic ETA is asserted.
// https://router.project-osrm.org/route/v1/driving/77.2195,28.6328;77.2285,28.6267?overview=full&geometries=geojson
const roadCoordinates = [
  [77.218419, 28.632856],
  [77.218424, 28.632937],
  [77.218425, 28.63295],
  [77.218463, 28.633109],
  [77.2185, 28.633197],
  [77.218528, 28.633262],
  [77.218616, 28.633405],
  [77.218798, 28.633601],
  [77.219, 28.633744],
  [77.219073, 28.633782],
  [77.219088, 28.633789],
  [77.219146, 28.633815],
  [77.219302, 28.633869],
  [77.219431, 28.633898],
  [77.219464, 28.633905],
  [77.219565, 28.633918],
  [77.219579, 28.633919],
  [77.219667, 28.633924],
  [77.21977, 28.633928],
  [77.219901, 28.633909],
  [77.220031, 28.633885],
  [77.220157, 28.633848],
  [77.220278, 28.633801],
  [77.220393, 28.633743],
  [77.220516, 28.633663],
  [77.22057, 28.633618],
  [77.220628, 28.63357],
  [77.220695, 28.633503],
  [77.220755, 28.633431],
  [77.220809, 28.633356],
  [77.220894, 28.633197],
  [77.22095, 28.63303],
  [77.220958, 28.632968],
  [77.220977, 28.632829],
  [77.220962, 28.632627],
  [77.220952, 28.632589],
  [77.22088, 28.632361],
  [77.220757, 28.632168],
  [77.221105, 28.631977],
  [77.221298, 28.631865],
  [77.221709, 28.631635],
  [77.222232, 28.631343],
  [77.222243, 28.631337],
  [77.222434, 28.631252],
  [77.222658, 28.631125],
  [77.222745, 28.631074],
  [77.223352, 28.630724],
  [77.223526, 28.630626],
  [77.22359, 28.63059],
  [77.223659, 28.630551],
  [77.223814, 28.630463],
  [77.223882, 28.630425],
  [77.223918, 28.630404],
  [77.225121, 28.629716],
  [77.225855, 28.629296],
  [77.226081, 28.629152],
  [77.226354, 28.628979],
  [77.226391, 28.628953],
  [77.226455, 28.628914],
  [77.226535, 28.62887],
  [77.226497, 28.62881],
  [77.226437, 28.628732],
  [77.22627, 28.628538],
  [77.226159, 28.628405],
  [77.225823, 28.628004],
  [77.225845, 28.627991],
  [77.226377, 28.627671],
  [77.226663, 28.627499],
  [77.227316, 28.627134],
  [77.227686, 28.626914],
  [77.228269, 28.626568],
  [77.228408, 28.626753],
];
export const demoRoute = roadCoordinates.map(([longitude, latitude]) => [
  latitude,
  longitude,
]);
// Separate OSRM road leg from the partner's sample acceptance location to the
// kitchen. Public example coordinates, never a user's actual device location.
// Retrieved 22 Sep 2026: 1,801.4 m / 213.9 s, no live traffic included.
const pickupCoordinates = [
  [77.213705, 28.637207],
  [77.21349, 28.637333],
  [77.213898, 28.637881],
  [77.213976, 28.637836],
  [77.214273, 28.637665],
  [77.214579, 28.63746],
  [77.214706, 28.637386],
  [77.2141, 28.636474],
  [77.214112, 28.636431],
  [77.214164, 28.636288],
  [77.214209, 28.636183],
  [77.214242, 28.636105],
  [77.217002, 28.634506],
  [77.217078, 28.634461],
  [77.217131, 28.634429],
  [77.217556, 28.634845],
  [77.218006, 28.635257],
  [77.218109, 28.635309],
  [77.218203, 28.635357],
  [77.218363, 28.635435],
  [77.21862, 28.63553],
  [77.218866, 28.635586],
  [77.219166, 28.635642],
  [77.21947, 28.635674],
  [77.219666, 28.6357],
  [77.219762, 28.635714],
  [77.21982, 28.635719],
  [77.219883, 28.635719],
  [77.219872, 28.635521],
  [77.219869, 28.635468],
  [77.219842, 28.634998],
  [77.219837, 28.634908],
  [77.219802, 28.6343],
  [77.219792, 28.634126],
  [77.21977, 28.633928],
  [77.219901, 28.633909],
  [77.220031, 28.633885],
  [77.220157, 28.633848],
  [77.220278, 28.633801],
  [77.220393, 28.633743],
  [77.220516, 28.633663],
  [77.22057, 28.633618],
  [77.220628, 28.63357],
  [77.220695, 28.633503],
  [77.220755, 28.633431],
  [77.220809, 28.633356],
  [77.220894, 28.633197],
  [77.22095, 28.63303],
  [77.220958, 28.632968],
  [77.220977, 28.632829],
  [77.220962, 28.632627],
  [77.220952, 28.632589],
  [77.22088, 28.632361],
  [77.220757, 28.632168],
  [77.220647, 28.632033],
  [77.220516, 28.631916],
  [77.220373, 28.631822],
  [77.220263, 28.631772],
  [77.22016, 28.631726],
  [77.219983, 28.631674],
  [77.219823, 28.631654],
  [77.219705, 28.631637],
  [77.219581, 28.631635],
  [77.219391, 28.631677],
  [77.219197, 28.631746],
  [77.218972, 28.63187],
  [77.218846, 28.631959],
  [77.218685, 28.632107],
  [77.218574, 28.632257],
  [77.21854, 28.632312],
  [77.21851, 28.632371],
  [77.218461, 28.632495],
  [77.218429, 28.632624],
  [77.218414, 28.632787],
  [77.218419, 28.632856],
];
export const demoPickupRoute = pickupCoordinates.map(
  ([longitude, latitude]) => [latitude, longitude],
);
export const demoPlan = {
  speed: 10, // 1 preview second = 10 planned service seconds, explicitly labelled.
  assignmentAt: 7,
  foodReadyAt: 19,
  pickupRouteSeconds: 213.9,
  deliveryRouteSeconds: 176.3,
  collectionSeconds: 20,
};
demoPlan.restaurantAt =
  demoPlan.assignmentAt +
  Math.ceil(demoPlan.pickupRouteSeconds / demoPlan.speed);
demoPlan.pickedUpAt =
  Math.max(demoPlan.restaurantAt, demoPlan.foodReadyAt) +
  demoPlan.collectionSeconds / demoPlan.speed;
demoPlan.departureAt = demoPlan.pickedUpAt + 1;
demoPlan.deliveredAt =
  demoPlan.departureAt +
  Math.ceil(demoPlan.deliveryRouteSeconds / demoPlan.speed);
export const demoStages = [
  {
    at: 0,
    status: "pending",
    label: "Order placed",
    title: "Your next good meal starts here.",
    detail: "Your demo order has reached the restaurant.",
  },
  {
    at: 2,
    status: "confirmed",
    label: "Restaurant accepted",
    title: "You’re on the kitchen’s list.",
    detail: "The restaurant has accepted the demo order.",
  },
  {
    at: 4,
    status: "preparing",
    label: "Preparing your meal",
    title: "A little sizzle. A lot of care.",
    detail: "Your demo meal is being freshly prepared.",
  },
  {
    at: demoPlan.assignmentAt,
    status: "assigned",
    label: "Partner travelling to kitchen",
    title: "Your partner is heading to the restaurant.",
    detail:
      "The demo rider accepted from their own starting location. Your meal is still being prepared.",
  },
  {
    at: demoPlan.foodReadyAt,
    status: "ready",
    orderStatus: "assigned",
    label: "Packed for pickup",
    title: "Fresh, packed and ready.",
    detail:
      "Your meal is packed. The demo rider is still on the road to the restaurant.",
  },
  {
    at: demoPlan.restaurantAt,
    status: "at_restaurant",
    orderStatus: "assigned",
    label: "Partner reached restaurant",
    title: "Your partner has reached the kitchen.",
    detail:
      "The rider has arrived and is collecting your packed meal. This is a separate pickup step, not an instant delivery.",
  },
  {
    at: demoPlan.pickedUpAt,
    status: "picked_up",
    orderStatus: "out_for_delivery",
    label: "Pickup confirmed",
    title: "Your meal is with your partner.",
    detail:
      "Pickup is confirmed. The demo rider can now leave for your doorstep.",
  },
  {
    at: demoPlan.departureAt,
    status: "out_for_delivery",
    label: "On the way",
    title: "A little closer. With every turn.",
    detail: "Follow the scooter along the demo route to your doorstep.",
  },
  {
    at: demoPlan.deliveredAt,
    status: "delivered",
    label: "Delivered",
    title: "At your door. Enjoy every bite.",
    detail: "Demo complete. No real order was placed or changed.",
  },
];
export const demoDuration = demoStages.at(-1).at;

export function deliveryDemoFrame(elapsed, now) {
  const stage = demoStages.findLastIndex((entry) => elapsed >= entry.at);
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const approachProgress = clamp(
    (elapsed - demoPlan.assignmentAt) /
      (demoPlan.restaurantAt - demoPlan.assignmentAt),
  );
  const deliveryProgress = clamp(
    (elapsed - demoPlan.departureAt) /
      (demoPlan.deliveredAt - demoPlan.departureAt),
  );
  const onDeliveryLeg = elapsed >= demoPlan.pickedUpAt;
  const route = onDeliveryLeg ? demoRoute : demoPickupRoute;
  const progress = onDeliveryLeg ? deliveryProgress : approachProgress;
  const point = positionOnRoute(route, progress).point;
  const pickupRemaining = demoPlan.pickupRouteSeconds * (1 - approachProgress);
  const preparationRemaining = Math.max(
    0,
    (demoPlan.foodReadyAt - elapsed) * demoPlan.speed,
  );
  const remainingSeconds =
    elapsed < demoPlan.restaurantAt
      ? Math.max(
          Math.max(0, demoPlan.assignmentAt - elapsed) * demoPlan.speed +
            pickupRemaining,
          preparationRemaining,
        ) +
        demoPlan.collectionSeconds +
        demoPlan.speed +
        demoPlan.deliveryRouteSeconds
      : elapsed < demoPlan.departureAt
        ? (demoPlan.departureAt - elapsed) * demoPlan.speed +
          demoPlan.deliveryRouteSeconds
        : demoPlan.deliveryRouteSeconds * (1 - deliveryProgress);
  return {
    stage,
    progress,
    route,
    leg: onDeliveryLeg ? "delivery" : "pickup",
    remainingSeconds,
    etaMinutes: Math.ceil(remainingSeconds / 60),
    pickupMinutes: Math.ceil(pickupRemaining / 60),
    statusTitle:
      elapsed < demoPlan.assignmentAt
        ? null
        : elapsed < demoPlan.restaurantAt
          ? "Your partner is heading to the restaurant"
          : elapsed < demoPlan.pickedUpAt
            ? "Your partner is collecting your meal"
            : elapsed < demoPlan.departureAt
              ? "Pickup confirmed"
              : elapsed < demoDuration
                ? "Your order is on the way"
                : "Delivered. Enjoy every bite.",
    order: {
      id: "local-delivery-demo",
      status: demoStages[stage].orderStatus || demoStages[stage].status,
      restaurant_detail: {
        name: "RuchiGo demo kitchen",
        latitude: demoRoute[0][0],
        longitude: demoRoute[0][1],
      },
      delivery_address_detail: {
        label: "Demo doorstep",
        latitude: demoRoute.at(-1)[0],
        longitude: demoRoute.at(-1)[1],
      },
      delivery:
        elapsed >= demoPlan.assignmentAt
          ? {
              current_latitude: point[0],
              current_longitude: point[1],
              location_updated_at: new Date(now).toISOString(),
            }
          : null,
    },
  };
}
