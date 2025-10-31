export const getSuggestion = (category, footprint) => {
  switch (category) {
    case "electricity":
      if (footprint > 1000) {
        return "Critical: Your electricity emissions are very high. Immediately switch to renewable energy sources, install solar panels, and replace all appliances with energy-efficient models.";
      } else if (footprint > 700) {
        return "High usage detected. Consider switching to renewable energy providers, installing LED lighting throughout, and using smart thermostats to optimize heating/cooling.";
      } else if (footprint > 500) {
        return "Moderate emissions. Switch to energy-efficient appliances, unplug devices when not in use, and consider solar panels for your home.";
      } else if (footprint > 300) {
        return "Good performance. Further reduce by using energy monitoring systems and setting devices to eco-mode.";
      } else {
        return "Excellent! Your electricity footprint is low. Maintain these habits and consider sharing your energy-saving tips with others.";
      }

    case "transport":
      if (footprint > 800) {
        return "Very high transport emissions. Consider switching to electric vehicles, carpooling, or relocating closer to work. Use public transport whenever possible.";
      } else if (footprint > 500) {
        return "High emissions detected. Try using public transport for daily commutes, consider hybrid vehicles, and combine multiple errands in one trip.";
      } else if (footprint > 300) {
        return "Moderate transport footprint. Increase use of public transport, cycle for short distances, or explore electric scooters/bikes.";
      } else if (footprint > 150) {
        return "Good transport habits. Further optimize by carpooling, using bike-sharing programs, and walking for nearby destinations.";
      } else {
        return "Outstanding! Your transport emissions are minimal. Keep using sustainable transport methods and inspire others to do the same.";
      }

    case "manufacturing":
      if (footprint > 2000) {
        return "Critical manufacturing emissions. Urgently implement circular economy principles, invest in clean technology, and conduct a full energy audit.";
      } else if (footprint > 1500) {
        return "Very high emissions. Optimize production processes, switch to renewable energy, implement waste recycling systems, and use sustainable raw materials.";
      } else if (footprint > 1000) {
        return "High manufacturing footprint. Reduce waste through lean manufacturing, invest in energy-efficient machinery, and explore carbon offset programs.";
      } else if (footprint > 600) {
        return "Moderate emissions. Continue improving with predictive maintenance to reduce energy waste and implement closed-loop water systems.";
      } else {
        return "Excellent manufacturing practices. Your emissions are low. Maintain efficiency and consider obtaining environmental certifications.";
      }

    case "construction":
      if (footprint > 1200) {
        return "Extremely high construction emissions. Use recycled materials, implement modular construction, switch to electric machinery, and minimize concrete usage.";
      } else if (footprint > 800) {
        return "High construction footprint. Use sustainable materials like bamboo and recycled steel, implement green building standards (LEED), and optimize site logistics.";
      } else if (footprint > 500) {
        return "Moderate emissions. Use locally-sourced materials to reduce transport emissions, implement efficient waste management, and use low-carbon concrete alternatives.";
      } else if (footprint > 300) {
        return "Good construction practices. Further reduce by using renewable energy on-site and implementing rainwater harvesting systems.";
      } else {
        return "Outstanding! Your construction emissions are well-controlled. Share your sustainable building practices as best practices in the industry.";
      }

    case "agriculture":
      if (footprint > 1500) {
        return "Very high agricultural emissions. Implement regenerative agriculture, reduce livestock density, use precision farming, and minimize chemical fertilizer use.";
      } else if (footprint > 1000) {
        return "High emissions detected. Adopt crop rotation, use organic fertilizers, implement drip irrigation, and consider agroforestry practices.";
      } else if (footprint > 800) {
        return "Moderate agricultural footprint. Reduce by using cover crops, implementing no-till farming, and optimizing livestock feed for lower methane emissions.";
      } else if (footprint > 500) {
        return "Good sustainable practices. Further improve with composting, integrated pest management, and renewable energy for farm operations.";
      } else {
        return "Excellent sustainable agriculture! Your emissions are low. Continue these practices and consider carbon farming for additional benefits.";
      }

    default:
      return "No specific suggestion available for this category. General advice: Monitor your emissions regularly and look for opportunities to switch to renewable energy.";
  }
};