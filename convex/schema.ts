import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  simulations: defineTable({
    // Grid state
    grid: v.array(
      v.array(
        v.object({
          row: v.number(),
          col: v.number(),
          type: v.union(
            v.literal("empty"),
            v.literal("robot"),
            v.literal("task"),
            v.literal("obstacle")
          ),
        })
      )
    ),

    // Entities
    robots: v.array(
      v.object({
        id: v.string(),
        position: v.array(v.number()),
        target: v.optional(v.array(v.number())),
        path: v.array(v.array(v.number())),
      })
    ),
    tasks: v.array(
      v.object({
        id: v.string(),
        position: v.array(v.number()),
        assignedTo: v.optional(v.string()),
      })
    ),

    // Simulation state
    isRunning: v.boolean(),
    isPaused: v.boolean(),
    speed: v.union(v.literal("slow"), v.literal("normal"), v.literal("fast")),
    strategy: v.union(v.literal("nearest"), v.literal("roundrobin")),

    // Metadata
    lastUpdateBy: v.optional(v.string()),
    lastUpdateAt: v.number(),
  }).index("by_update", ["lastUpdateAt"]),
});
