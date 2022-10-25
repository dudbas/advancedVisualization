//Visualization Using AJAX 
//James Lam CSE 332
function scree() {
    var margin = {
            top: 30,
            right: 30,
            bottom: 70,
            left: 60
        },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    var svg = d3.select("#graphingLocation1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.top + 20)
        .text("PC");
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top - height / 2 + 20)
        .text("Eigen Value")
    total = 0;
    d3.csv("http://localhost:5000/scree", function (data) {
        var x = d3.scaleBand()
            .range([0, width])
            .domain(data.map(function (d) {
                return d.index;
            }))
            .padding(0.2);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(3,0)rotate(0)")
            .style("text-anchor", "end");
        var y = d3.scaleLinear()
            .domain([0, 8])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));
        svg.selectAll("mybar")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", function (d) {
                return x(d.index);
            })
            .attr("y", function (d) {
                return y(d.value);
            })
            .attr("width", x.bandwidth())
            .attr("height", function (d) {
                return height - y(d.value);
            })
            .attr("fill", "#A00")
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "Black")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d) {
                    return x(d.index);
                })
                .y(function (d) {
                    total = (parseFloat(total) + parseFloat(d.value));
                    console.log(total + " ")
                    return y(total);
                })
            )
            .attr("transform", "translate(15,0)")
    })
}

function visualize(val) {
    var x;
    document.getElementById("graphingLocation").innerHTML = "";
    document.getElementById("graphingLocation1").innerHTML = "";
    document.getElementById("graphingLocation2").innerHTML = "";
    //CORRELATION GRAPH ---------------------------------------------------------------
    if (val == 'correlation') {
        $.ajax({
            type: "GET",
            url: "http://localhost:5000/correlation",
            async: false,
            success: function (data) {
                x = data;
            }
        });
        var margin = {
                top: 30,
                right: -200,
                bottom: 70,
                left: 200
            },
            width = 500,
            height = 500;
        var svg = d3.select("#graphingLocation")
            .append("svg")
            .attr("width", 1000)
            .attr("height", 10300)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
        var groups = ["crash_date", "crash_time", "on_street", 'contributing_factor_vehicle_1', 'contributing_factor_vehicle_2', 'order_type', 'sign_code', 'sign_description']
        var vars = ["crash_date", "crash_time", "on_street", 'contributing_factor_vehicle_1', 'contributing_factor_vehicle_2', 'order_type', 'sign_code', 'sign_description']
        var x = d3.scaleBand()
            .range([0, width])
            .domain(groups)
            .padding(0.01);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");
        var y = d3.scaleBand()
            .range([height, 0])
            .domain(vars)
            .padding(0.01);
        svg.append("g")
            .call(d3.axisLeft(y));
        var color = d3.scaleLinear()
            .range(["#e61f00", "#ffffff", "#0095ff"])
            .domain([-0.01, 0, 0.8])
        d3.csv("http://localhost:5000/correlation", function (data) {
            svg.selectAll()
                .data(data, function (d) {
                    return d.index + ':' + d.x;
                })
                .enter()
                .append("rect")
                .attr("x", function (d) {
                    return x(d.index)
                })
                .attr("y", function (d) {
                    return y(d.x)
                })
                .attr("width", x.bandwidth())
                .attr("height", y.bandwidth())
                .style("fill", function (d) {
                    return color(d.data)
                })
        })

    }
    //SCATTER GRAPH ---------------------------------------------------------------
    if (val == 'scatter') {
        $.ajax({
            type: "GET",
            url: "http://localhost:5000/scatter",
            async: false,
            success: function (data) {
                x = data;
            }
        });
        var margin = {
                top: 10,
                right: 10,
                bottom: 1000,
                left: 10
            },
            width = 460 - margin.left - margin.right,
            perimeter = 700 - margin.left - margin.right
        var svg = d3.select("#graphingLocation")
            .append("svg")
            .attr("width", perimeter + margin.left + margin.right + 1000)
            .attr("height", perimeter + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.csv("http://localhost:5000/scatter", function (data) {
            var varList = ["crash_date", "crash_time", "on_street", "sign_code", "sign_description"]
            size = perimeter / varList.length
            mar = 20

            var position = d3.scalePoint()
                .domain(varList)
                .range([0, perimeter - size])
            var color = d3.scaleOrdinal()
            for (i in varList) {
                for (j in varList) {
                    var var1 = varList[i]
                    var var2 = varList[j]
                    xr = d3.extent(data, function (d) {
                        return +d[var1]
                    })
                    var x = d3.scaleLinear()
                        .domain(xr).nice()
                        .range([0, size - 2 * mar]);
                    yr = d3.extent(data, function (d) {
                        return +d[var2]
                    })
                    var y = d3.scaleLinear()
                        .domain(yr).nice()
                        .range([size - 2 * mar, 0]);
                    var mini = svg
                        .append('g')
                        .attr("transform", "translate(" + (position(var1) + mar) + "," + (position(var2) + mar) + ")");
                    mini.append("g")
                        .attr("transform", "translate(" + 0 + "," + (size - mar * 2) + ")")
                        .call(d3.axisBottom(x).ticks(3));
                    mini.append("g")
                        .call(d3.axisLeft(y).ticks(3));
                    mini
                        .selectAll("myCircles")
                        .data(data)
                        .enter()
                        .append("circle")
                        .attr("cx", function (d) {
                            return x(+d[var1])
                        })
                        .attr("cy", function (d) {
                            return y(+d[var2])
                        })
                        .attr("r", 3)
                        .attr("fill", function (d) {
                            return color()
                        })
                        .style("opacity", 0.3)
                }
            }
            for (i in varList) {
                for (j in varList) {
                    if (i != j) {
                        continue;
                    }
                    var var1 = varList[i]
                    var var2 = varList[j]
                    svg
                        .append('g')
                        .attr("transform", "translate(" + position(var1) + "," + 0 + ")")
                        .append('text')
                        .attr("x", size / 2)
                        .attr("y", 700)
                        .text(var1)
                        .attr("text-anchor", "middle")
                    svg
                        .append('g')
                        .append('text')
                        .attr("transform", "translate(" + 0 + "," + position(var2) + ")rotate(-90)")
                        .attr("x", size / 2 - 140)
                        .attr("y", 700)
                        .text(var2)
                        .attr("text-anchor", "middle")

                }
            }

        })


    }
    //PARALLEL GRAPH ---------------------------------------------------------------
    if (val == 'parallel') {
        $.ajax({
            type: "GET",
            url: "http://localhost:5000/parallel",
            async: false,
            success: function (data) {
                x = data;
            }
        });
        var margin = {
                top: 100,
                right: 10,
                bottom: 10,
                left: 0
            },
            width = 500 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
        var svg = d3.select("#graphingLocation")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
        d3.csv("http://localhost:5000/parallel", function (data) {
            dimensions = d3.keys(data[0]).filter(function (d) {
                return d != "borough" && d
            })
            var y = {}
            for (i in dimensions) {
                name = dimensions[i]
                y[name] = d3.scaleBand()
                    .domain(data.map(function (d) {
                        return d[name];
                    }))
                    .range([height, 0])
            }
            x = d3.scaleBand()
                .range([0, width])
                .padding(1)
                .domain(dimensions);

            function path(d) {
                return d3.line()(dimensions.map(function (p) {
                    return [x(p), y[p](d[p])];
                }));
            }
            svg
                .selectAll("line")
                .data(data)
                .enter().append("path")
                .attr("d", path)
                .style("fill", "none")
                .style("stroke", "#000")
                .style("opacity", 0.05)

            svg.selectAll("axis")
                .data(dimensions).enter()
                .append("g")
                .attr("transform", function (d) {
                    return "translate(" + x(d) + ")";
                })
                .each(function (d) {
                    d3.select(this).call(d3.axisLeft().scale(y[d]));
                })
                .append("text")
                .style("text-anchor", "middle")
                .attr("y", -9)
                .attr("transform", "rotate(-45)")
                .text(function (d) {
                    return d;
                })
                .style("fill", "black")

        })


    }

    if (val == 'pca') {
        $.ajax({
            type: "GET",
            url: "http://localhost:5000/pca",
            async: false,
            success: function (data) {
                x = data;
            }
        });
        var margin = {
                top: 10,
                right: 30,
                bottom: 40,
                left: 50
            },
            width = 520 - margin.left - margin.right,
            height = 520 - margin.top - margin.bottom;

        var svg = d3.select("#graphingLocation")
            .append("svg")
            .attr("width", 1000)
            .attr("height", 600)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")")

        d3.csv("http://localhost:5000/pca", function (data) {

            var x = d3.scaleLinear()
                .domain([-3, 5])
                .range([0, width])
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .select(".domain").remove()

            var y = d3.scaleLinear()
                .domain([-3, 5])
                .range([height, 0])
                .nice()
            svg.append("g")
                .call(d3.axisLeft(y))
                .select(".domain").remove()

            svg.selectAll(".tick line").attr("stroke", "white")
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("x", width / 2 + margin.left)
                .attr("y", height + margin.top + 20)
                .text("PC2");
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left + 20)
                .attr("x", -margin.top - height / 2 + 20)
                .text("PC1")
            var color = d3.scaleOrdinal()
                .domain(["R-", "S-", "ST", "C-", "P-", "SC"])
                .range(['#FF8066', '#FFCC66', '#E5FF66', '#66FFB3', '#66FFFF', '#6699FF'])
            svg.append('g')
                .selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return x(d.PC1);
                })
                .attr("cy", function (d) {
                    return y(d.PC2);
                })
                .attr("r", 5)
                .style("fill", function (d) {
                    return color(d.order_type)
                })
                .style("opacity", 0.08)
            var keys = ["R-", "S-", "ST", "C-", "P-", "SC"]
            svg.selectAll("mydots")
                .data(keys)
                .enter()
                .append("circle")
                .attr("cx", 600)
                .attr("cy", function (d, i) {
                    return 100 + i * 25
                })
                .attr("r", 7)
                .style("fill", function (d, i) {
                    return color(keys[i])
                })
            svg.selectAll("mylabels")
                .data(keys)
                .enter()
                .append("text")
                .attr("x", 620)
                .attr("y", function (d, i) {
                    return 100 + i * 25
                })
                .text(function (d, i) {
                    return keys[i]
                })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")

        })
        scree();
    }
    if (val == 'bi') {
        $.ajax({
            type: "GET",
            url: "http://localhost:5000/bi",
            async: false,
            success: function (data) {
                x = data;
            }
        });
        var margin = {
                top: 10,
                right: 30,
                bottom: 40,
                left: 50
            },
            width = 520 - margin.left - margin.right,
            height = 520 - margin.top - margin.bottom;

        var svg = d3.select("#graphingLocation")
            .append("svg")
            .attr("width", 1000)
            .attr("height", 600)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")")

        d3.csv("http://localhost:5000/pca", function (data) {

            var x = d3.scaleLinear()
                .domain([-3, 5])
                .range([0, width])
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .select(".domain").remove()

            var y = d3.scaleLinear()
                .domain([-3, 5])
                .range([height, 0])
                .nice()
            svg.append("g")
                .call(d3.axisLeft(y))
                .select(".domain").remove()

            svg.selectAll(".tick line").attr("stroke", "white")
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("x", width / 2 + margin.left)
                .attr("y", height + margin.top + 20)
                .text("PC2");
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left + 20)
                .attr("x", -margin.top - height / 2 + 20)
                .text("PC1")
            var color = d3.scaleOrdinal()
                .domain(["R-", "S-", "ST", "C-", "P-", "SC"])
                .range(['#FF8066', '#FFCC66', '#E5FF66', '#66FFB3', '#66FFFF', '#6699FF'])
            svg.append('g')
                .selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return x(d.PC1);
                })
                .attr("cy", function (d) {
                    return y(d.PC2);
                })
                .attr("r", 5)
                .style("fill", function (d) {
                    return color(d.order_type)
                })
                .style("opacity", 0.08)
            var keys = ["R-", "S-", "ST", "C-", "P-", "SC"]
            svg.selectAll("mydots")
                .data(keys)
                .enter()
                .append("circle")
                .attr("cx", 600)
                .attr("cy", function (d, i) {
                    return 100 + i * 25
                })
                .attr("r", 7)
                .style("fill", function (d, i) {
                    return color(keys[i])
                })
            svg.selectAll("mylabels")
                .data(keys)
                .enter()
                .append("text")
                .attr("x", 620)
                .attr("y", function (d, i) {
                    return 100 + i * 25
                })
                .text(function (d, i) {
                    return keys[i]
                })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")

            d3.csv("http://localhost:5000/bi", function (data) {
                var xx = d3.scaleLinear()
                    .domain([-3, 5])
                    .range([0, width]);
                svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(xx));
                var yy = d3.scaleLinear()
                    .domain([-3, 5])
                    .range([height, 0]);
                svg.append("g")
                    .call(d3.axisLeft(yy));
                svg.append('g')
                    .selectAll("dot")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("cx", function (d) {
                        return xx(d.PC1);
                    })
                    .attr("cy", function (d) {
                        return yy(d.PC2);
                    })
                    .attr("r", 5)
                    .style("fill", "black")

                svg.append('g')
                    .selectAll('dot')
                    .data(data)
                    .enter()
                    .append("text")
                    .attr("text-anchor", "middle")
                    .attr("x", function (d) {
                        return xx(d.PC1);
                    })
                    .attr("y", function (d) {
                        return yy(d.PC2) + 10;
                    })
                    .style("font-size", "8px")
                    .attr("dy", ".1em").text(function (d) {
                        return d.index
                    })

                svg
                    .append('g')
                    .selectAll("dot")
                    .data(data)
                    .enter()
                    .append('line')
                    .style("stroke", "black")
                    .attr('x1', function (d) {
                        return xx(d.PC1);
                    })
                    .attr('x2', xx(0))
                    .attr('y1', function (d) {
                        return yy(d.PC2);
                    })
                    .attr('y2', yy(0))
            })
            
        })
    }
    if (val == 'mData') {
        $.ajax({
            type: "GET",
            url: "http://localhost:5000/mData",
            async: false,
            success: function (data) {
                x = data;
            }
        });
        var margin = {
                top: 10,
                right: 30,
                bottom: 30,
                left: 60
            },
            width = 460 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
        var svg = d3.select("#graphingLocation")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
        d3.csv("http://localhost:5000/mdata", function (data) {

            var x = d3.scaleLinear()
                .domain([-3, 3])
                .range([0, width]);
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));
            var y = d3.scaleLinear()
                .domain([-3, 3])
                .range([height, 0]);
            svg.append("g")
                .call(d3.axisLeft(y));
            svg.append('g')
                .selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return x(d.x);
                })
                .attr("cy", function (d) {
                    return y(d.y);
                })
                .attr("r", 1.5)
                .style("fill", "#00000")

        })

    }
    if (val == 'mAttributes') {
        $.ajax({
            type: "GET",
            url: "http://localhost:5000/mAttributes",
            async: false,
            success: function (data) {
                x = data;
            }
        });
        var margin = {
                top: 10,
                right: 30,
                bottom: 30,
                left: 60
            },
            width = 460 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
        var svg = d3.select("#graphingLocation")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
        d3.csv("http://localhost:5000/mAttributes", function (data) {
            var x = d3.scaleLinear()
                .domain([-3, 3])
                .range([0, width]);
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));
            var y = d3.scaleLinear()
                .domain([-3, 3])
                .range([height, 0]);
            svg.append("g")
                .call(d3.axisLeft(y));
            svg.append('g')
                .selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return x(d.x);
                })
                .attr("cy", function (d) {
                    return y(d.y);
                })
                .attr("r", 1.5)
                .style("fill", "#69b3a2")
        })
        d3.csv("http://localhost:5000/mAttributes", function (data) {
            var xx = d3.scaleLinear()
                .domain([-3, 3])
                .range([0, width]);
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xx));
            var yy = d3.scaleLinear()
                .domain([-3, 3])
                .range([height, 0]);
            svg.append("g")
                .call(d3.axisLeft(yy));
            svg.append('g')
                .selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return xx(d.x);
                })
                .attr("cy", function (d) {
                    return yy(d.y);
                })
                .attr("r", 5)
                .style("fill", "black")

            svg.append('g')
                .selectAll('dot')
                .data(data)
                .enter()
                .append("text")
                .attr("text-anchor", "middle")
                .attr("x", function (d) {
                    return xx(d.x);
                })
                .attr("y", function (d) {
                    return yy(d.y) + 10;
                })
                .style("font-size", "8px")
                .attr("dy", ".1em").text(function (d, i) {
                    return d.attributes
                })

            svg
                .append('g')
                .selectAll("dot")
                .data(data)
                .enter()
                .append('line')
                .style("stroke", "black")
                .attr('x1', function (d) {
                    return xx(d.x);
                })
                .attr('x2', xx(0))
                .attr('y1', function (d) {
                    return yy(d.y);
                })
                .attr('y2', yy(0))
        })

    }
}