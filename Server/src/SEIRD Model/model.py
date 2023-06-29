import numpy as np
import os
from scipy.integrate import odeint
import matplotlib.pyplot as plt
import json
from gekko import GEKKO
import sys

# base_path = os.path.dirname(os.path.abspath(__file__))
# path = os.path.join(base_path, "parameters.json")
# fhand = open(path)
# parameters = json.load(fhand)
parameters = json.loads(str(sys.argv[1]))["provData"]
# parameters = json.load(open("parameters.json"))["provData"]

provinces = {
    "Alberta",
    "BritishColumbia",
    "Manitoba",
    "NewBrunswick",
    "NewfoundlandandLabrador",
    "NovaScotia",
    "Ontario",
    "PrinceEdwardIsland",
    "Quebec",
    "Saskatchewan",
    "NorthwestTerritories",
    "Nunavut",
    "Yukon",
}

result = dict()


def optimize_social_distancing():

    pass


for province in provinces:

    SOCIAL_DISTANCING = float(parameters[province]["socialDistanceValue"])
    TRANSMISSION_RATE = float(parameters["transmissionRate"])
    INCUBATION_PERIOD = float(parameters["incubationPeriod"])
    INFECTIVE_PERIOD = float(parameters["infectivePeriod"])
    CHANCE_OF_ASYMPTOMATIC = float(parameters["chanceOfAsymptomatic"])
    CHANCE_OF_HOSPITALIZATION = float(parameters["chanceOfHospitalization"])
    DEATH_RATE_AFTER_HOSPITALIZATION = float(parameters["deathRateAfterHospitalization"])
    POPULATION = float(parameters[province]["population"])
    MUTATION_PERIOD = float(parameters["mutationPeriod"])
    INITIAL_CASES = float(parameters[province]["initialCases"])
    TIME_PERIOD = int(parameters["simulationPeriod"])
    PROVIDE_SOCIAL_DISTANCING = int(parameters["provideSocialDistancing"])
    LEAVING_POPULATION = float(parameters[province]["leavingPopulation"]) / POPULATION
    random_nos = np.random.rand(7)
    random_nos = random_nos / np.sum(random_nos)
    leaving_population_dist = (-1) * (0.01) * np.dot(LEAVING_POPULATION, random_nos)
    random_nos = np.random.rand(7)
    random_nos = random_nos / np.sum(random_nos)
    entering_population_dist = np.dot(LEAVING_POPULATION, random_nos)
    alpha = TRANSMISSION_RATE / INFECTIVE_PERIOD
    beta = 1 / INCUBATION_PERIOD
    gamma = 1 / INFECTIVE_PERIOD
    delta = CHANCE_OF_ASYMPTOMATIC
    epsilon = DEATH_RATE_AFTER_HOSPITALIZATION
    zeta = CHANCE_OF_HOSPITALIZATION
    eta = 1 / MUTATION_PERIOD
    u = SOCIAL_DISTANCING

    e0 = INITIAL_CASES / POPULATION
    i_s0 = 0.00
    i_a0 = 0.00
    i_h0 = 0.00
    r0 = 0.00
    d0 = 0.00
    s0 = 1 - e0 - i_s0 - i_a0 - i_h0 - r0 - d0
    x0 = [s0, e0, i_s0, i_a0, i_h0, r0, d0]

    def disease(x, t):
        s, e, i_s, i_a, i_h, r, d = x
        dx = np.zeros(7)
        dx[0] = -(1 - u) * alpha * s * (i_s + i_a) + eta * (i_s + i_a) * r  # s
        dx[1] = (1 - u) * alpha * s * (i_s + i_a) - beta * e  # e
        dx[2] = (1 - zeta) * (1 - delta) * beta * e - gamma * i_s  # I_s
        dx[3] = delta * beta * e - gamma * i_a  # I_a
        dx[4] = zeta * (1 - delta) * beta * e - gamma * i_h  # I_h
        dx[5] = gamma * i_s + (1 - epsilon) * gamma * i_h + gamma * i_a - eta * (i_s + i_a) * r  # R
        dx[6] = epsilon * gamma * i_h  # D
        dx = np.sum([dx, leaving_population_dist], axis=0)
        dx = np.sum([dx, entering_population_dist], axis=0)
        return dx

    t = np.linspace(0, TIME_PERIOD, TIME_PERIOD + 1)
    x = odeint(disease, x0, t)
    s = x[:, 0]
    e = x[:, 1]
    i_s = x[:, 2]
    i_a = x[:, 3]
    i_h = x[:, 4]
    r = x[:, 5]
    d = x[:, 6]

    if PROVIDE_SOCIAL_DISTANCING == 1:
        g = GEKKO(remote=False)

        u_o = g.MV(0, lb=0.0, ub=0.8)
        s_o, e_o, i_s_o, i_a_o, i_h_o, r_o, d_o = g.Array(g.Var, 7)
        g.time = t

        s_o.value = s0
        e_o.value = e0
        i_s_o.value = i_s0
        i_a_o.value = i_a0
        i_h_o.value = i_h0
        r_o.value = r0
        d_o.value = d0

        g.Equations(
            [
                s_o.dt() == -(1 - u_o) * alpha * s_o * (i_s_o + i_a_o) + eta * (i_s_o + i_a_o) * r_o,
                e_o.dt() == (1 - u_o) * alpha * s_o * (i_s_o + i_a_o) - beta * e_o,
                i_s_o.dt() == (1 - zeta) * (1 - delta) * beta * e_o - gamma * i_s_o,
                i_a_o.dt() == delta * beta * e_o - gamma * i_a_o,
                i_h_o.dt() == zeta * (1 - delta) * beta * e_o - gamma * i_h_o,
                r_o.dt() == gamma * i_s_o + (1 - epsilon) * gamma * i_h_o + gamma * i_a_o - eta * (i_s_o + i_a_o) * r_o,
                d_o.dt() == epsilon * gamma * i_h_o,
            ]
        )
        g.options.IMODE = 7
        g.options.NODES = 3
        g.solve(disp=False)
        g.options.IMODE = 6
        i_h_o.UPPER = float(parameters[province]["bedCapacity"]) / POPULATION
        u_o.STATUS = 1
        g.options.SOLVER = 1
        g.options.TIME_SHIFT = 0

        s_o.value = s_o.value.value
        e_o.value = e_o.value.value
        i_s_o.value = i_s_o.value.value
        i_a_o.value = i_a_o.value.value
        i_h_o.value = i_h_o.value.value
        r_o.value = r_o.value.value
        d_o.value = d_o.value.value
        g.Minimize(u_o)
        try:
            g.solve(disp=True)
        except:
            print("no solution found")
        u_o = list(u_o)
    else:
        u_o = 0

    result[province] = {
        "Susceptible": list(s),
        "Exposed": list(e),
        "Infected Symptomatic": list(i_s),
        "Infected Asymptomatic": list(i_a),
        "Infected Hospitalized": list(i_h),
        "Recovered": list(r),
        "Death": list(d),
        "Optimized Social Distancing": u_o,
    }
fhand = open("result.json", "w")
json.dump(result, fhand)
