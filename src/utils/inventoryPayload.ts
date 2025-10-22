import type { InventoryInput } from "@/types/inventory";

export const buildInventoryPayload = (input: InventoryInput): Record<string, string | number> => {
const payload: Record<string, string | number> = {
name: input.name,
location: input.location,
};


if (typeof input.capacity === "number") {
payload.capacity = input.capacityUnit ? `${input.capacity} ${input.capacityUnit}` : input.capacity;
} else {
payload.capacity = input.capacity;
}


return payload;
};