import type { Plant } from "@prisma/client";

export type PlantStatusType =
  | "overdue"
  | "never"
  | "good"
  | "due-today"
  | "due-soon";

export interface StatusConfig {
  text: string;
  class: string;
  dotClass: string;
  bgClass: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
  subtextColor: string;
  icon: string;
  buttonClass: string;
  buttonText: string;
}

export interface UrgencyMessage {
  title: string;
  subtitle: string;
  bgClass: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
  subtextColor: string;
  icon: string;
}

export class PlantStatusHelper {
  static getOverdueStatus(plant: Plant): PlantStatusType {
    const now = new Date();

    if (!plant.lastWatered) {
      return "never";
    }

    const lastWateredDate = new Date(plant.lastWatered);
    const nextWateringTime =
      lastWateredDate.getTime() +
      plant.wateringFrequencyDays * 24 * 60 * 60 * 1000;

    // Calculate days until next watering
    const daysUntilNext = Math.ceil(
      (nextWateringTime - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (now.getTime() > nextWateringTime) {
      return "overdue";
    } else if (daysUntilNext === 0) {
      return "due-today";
    } else if (daysUntilNext <= 1) {
      return "due-soon";
    } else {
      return "good";
    }
  }

  static getStatusConfig(plant: Plant): StatusConfig {
    const status = this.getOverdueStatus(plant);

    const configs: Record<PlantStatusType, StatusConfig> = {
      overdue: {
        text: "Urgent",
        class: "bg-red-50/80 text-red-700 border-red-200/50",
        dotClass: "bg-red-500",
        bgClass: "bg-red-50 border border-red-100",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        textColor: "text-red-800",
        subtextColor: "text-red-600",
        icon: "mdi:alert-circle",
        buttonClass:
          "bg-gradient-to-r from-red-500 to-rose-500 text-white focus:ring-red-500 hover:from-red-600 hover:to-rose-600",
        buttonText: "Log Watering",
      },
      never: {
        text: "New",
        class: "bg-amber-50/80 text-amber-700 border-amber-200/50",
        dotClass: "bg-amber-500",
        bgClass: "bg-amber-50 border border-amber-100",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        textColor: "text-amber-800",
        subtextColor: "text-amber-600",
        icon: "mdi:seedling",
        buttonClass:
          "bg-gradient-to-r from-amber-500 to-orange-500 text-white focus:ring-amber-500 hover:from-amber-600 hover:to-orange-600",
        buttonText: "Record Watering",
      },
      "due-today": {
        text: "Due Today",
        class: "bg-blue-50/80 text-blue-700 border-blue-200/50",
        dotClass: "bg-blue-500",
        bgClass: "bg-blue-50 border border-blue-100",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        textColor: "text-blue-800",
        subtextColor: "text-blue-600",
        icon: "mdi:water",
        buttonClass:
          "bg-gradient-to-r from-blue-500 to-indigo-500 text-white focus:ring-blue-500 hover:from-blue-600 hover:to-indigo-600",
        buttonText: "Water Now",
      },
      "due-soon": {
        text: "Due Soon",
        class: "bg-yellow-50/80 text-yellow-700 border-yellow-200/50",
        dotClass: "bg-yellow-500",
        bgClass: "bg-yellow-50 border border-yellow-100",
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600",
        textColor: "text-yellow-800",
        subtextColor: "text-yellow-600",
        icon: "mdi:clock-outline",
        buttonClass:
          "bg-gradient-to-r from-yellow-500 to-amber-500 text-white focus:ring-yellow-500 hover:from-yellow-600 hover:to-amber-600",
        buttonText: "Water Early",
      },
      good: {
        text: "Healthy",
        class: "bg-emerald-50/80 text-emerald-700 border-emerald-200/50",
        dotClass: "bg-emerald-500",
        bgClass: "bg-emerald-50 border border-emerald-100",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        textColor: "text-emerald-800",
        subtextColor: "text-emerald-600",
        icon: "mdi:check-circle",
        buttonClass:
          "bg-gradient-to-r from-emerald-500 to-teal-500 text-white focus:ring-emerald-500 hover:from-emerald-600 hover:to-teal-600",
        buttonText: "Record Watering",
      },
    };

    return configs[status];
  }

  static getUrgencyMessage(plant: Plant): UrgencyMessage {
    const now = new Date();
    const status = this.getOverdueStatus(plant);
    const config = this.getStatusConfig(plant);

    if (status === "never") {
      return {
        title: "Track first watering",
        subtitle: "Record when you water this plant",
        bgClass: config.bgClass,
        iconBg: config.iconBg,
        iconColor: config.iconColor,
        textColor: config.textColor,
        subtextColor: config.subtextColor,
        icon: config.icon,
      };
    }

    if (status === "overdue") {
      const lastWatered = new Date(plant.lastWatered!);
      const daysSinceWatered = Math.floor(
        (now.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24),
      );
      const daysOverdue = daysSinceWatered - plant.wateringFrequencyDays;

      return {
        title: "Watering overdue!",
        subtitle: `${daysOverdue} day${
          daysOverdue === 1 ? "" : "s"
        } past schedule`,
        bgClass: config.bgClass,
        iconBg: config.iconBg,
        iconColor: config.iconColor,
        textColor: config.textColor,
        subtextColor: config.subtextColor,
        icon: config.icon,
      };
    }

    if (status === "due-today") {
      return {
        title: "Watering due today",
        subtitle: "Perfect time to water your plant",
        bgClass: config.bgClass,
        iconBg: config.iconBg,
        iconColor: config.iconColor,
        textColor: config.textColor,
        subtextColor: config.subtextColor,
        icon: config.icon,
      };
    }

    if (status === "due-soon") {
      return {
        title: "Watering due soon",
        subtitle: "Due within the next day",
        bgClass: config.bgClass,
        iconBg: config.iconBg,
        iconColor: config.iconColor,
        textColor: config.textColor,
        subtextColor: config.subtextColor,
        icon: config.icon,
      };
    }

    // Healthy plant
    const lastWatered = new Date(plant.lastWatered!);
    const nextWatering = new Date(
      lastWatered.getTime() + plant.wateringFrequencyDays * 24 * 60 * 60 * 1000,
    );
    const daysUntilNext = Math.ceil(
      (nextWatering.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    let subtitle = "";
    if (daysUntilNext === 1) subtitle = "Next watering due tomorrow";
    else subtitle = `Next watering in ${daysUntilNext} days`;

    return {
      title: "On schedule",
      subtitle,
      bgClass: config.bgClass,
      iconBg: config.iconBg,
      iconColor: config.iconColor,
      textColor: config.textColor,
      subtextColor: config.subtextColor,
      icon: config.icon,
    };
  }

  static getDaysSinceWatered(plant: Plant): string {
    if (!plant.lastWatered) return "Never";

    const now = new Date();
    const lastWatered = new Date(plant.lastWatered);
    const diffDays = Math.floor(
      (now.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24),
    );

    return diffDays === 0 ? "Today" : diffDays.toString();
  }

  static getDaysUntilNextWatering(plant: Plant): number | null {
    if (!plant.lastWatered) return null;

    const now = new Date();
    const lastWatered = new Date(plant.lastWatered);
    const nextWateringTime =
      lastWatered.getTime() + plant.wateringFrequencyDays * 24 * 60 * 60 * 1000;

    return Math.ceil(
      (nextWateringTime - now.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  static getWateringScheduleText(plant: Plant): string {
    const daysUntil = this.getDaysUntilNextWatering(plant);

    if (daysUntil === null) return "No watering history";
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
    if (daysUntil === 0) return "Due today";
    if (daysUntil === 1) return "Due tomorrow";
    return `Due in ${daysUntil} days`;
  }
}
