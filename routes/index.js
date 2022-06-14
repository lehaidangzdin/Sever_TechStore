const express = require('express');
const router = express.Router();
// const db = require("./Database/DB.js");
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const cookieParser = require('cookie-parser')
router.use(cookieParser())
//CONNECT MYSQL
router.use('/static', express.static('../public/stylesheets/style.css'))
const con = mysql.createConnection({
    host: "sql6.freesqldatabase.com",
    user: "sql6499385",
    password: "PYpethsMEv",
    database: "sql6499385",
});
con.connect(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Connected!");
    }
});

// ================= LOGIN
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Login'});
});
router.post("/Login", function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    // console.log(username, password);
    if (username == "admin") {
        let sql = "SELECT * FROM KhachHang WHERE tenDangNhap = 'admin'";
        con.query(sql, function (err, rows) {
            if (err) {
                console.log(err.message);
                throw new Error(err.message);
            } else {
                if (rows.length > 0) {
                    if (password == rows[0].matKhau) {
                        let token = jwt.sign({
                            _id: rows[0].maKH
                        }, 'mk');
                        // console.log(token);
                        return res.json({
                            message: "Thanh cong",
                            token: token
                        })
                    } else {
                        return res.json({
                            message: "Mật khẩu không chính xác!",
                        })
                    }
                }
            }
        })
    } else {
        return res.json({
            message: "Chỉ admin mới có thể đăng nhập!",
        })
    }


})
// ================= HOME
router.get('/Home', function (req, res, next) {
    try {
        let token = req.cookies;
        // console.log(token);
        let ketqua = jwt.verify(token.token, "mk");
        if (ketqua) {
            next();
        }
    } catch (e) {
        // res.json("ban can dang nhap");
        res.redirect('/');
    }
}, function (req, res, next) {
    con.query("SELECT * FROM SanPham WHERE isDelete = 0 ", function (err, rows, fields) {
        if (err) {
            throw new err;
            console.log(err.message);
        } else {
            // console.log(rows[0]);
            res.render('Home', {title: 'Home', data: rows, message: ""});
        }
    })
});
// DETAIL PRODUCT
router.get('/Product/Detail/:maSp', function (req, res, next) {
    try {
        let token = req.cookies;
        // console.log(token);
        let ketqua = jwt.verify(token.token, "mk");
        if (ketqua) {
            next();
        }
    } catch (e) {
        // res.json("ban can dang nhap");
        res.redirect('/');
    }
}, function (req, res, next) {
    let maSp = req.params.maSp;
    con.query("SELECT * FROM SanPham WHERE maSP LIKE " + maSp, function (err, rows, fields) {
        if (err) {
            throw err;
            console.log(err.message);
        } else {
            res.render('Detail', {title: 'Chi tiết sản phẩm', detailProduct: rows});
        }
    })
});
// UPDATE PRODUCT
router.get('/Product/update/:maSp', function (req, res, next) {
    try {
        let token = req.cookies;
        // console.log(token);
        let ketqua = jwt.verify(token.token, "mk");
        if (ketqua) {
            next();
        }
    } catch (e) {
        // res.json("ban can dang nhap");
        res.redirect('/');
    }
}, function (req, res, next) {
    let maSp = req.params.maSp;
    con.query("SELECT * FROM SanPham WHERE maSP LIKE " + maSp, function (err, rows, fields) {
        if (err) {
            throw new err;
            console.log(err.message);
        } else {
            res.render('Update', {title: 'Sửa thông tin', detailProduct: rows});
        }
    })
});
router.post('/UpdateProduct', function (req, res, next) {
    let maSp = req.body.maSP;
    let maLoai = req.body.maLoai;
    let tenSP = req.body.nameProduct;
    let soLuongNhap = req.body.numProduct;
    let hinhAnh = req.body.imgProduct;
    let giaTien = req.body.priceProduct;
    let giaCu = req.body.oldPriceProduct;
    let thongTin = req.body.moreInforProduct;

    if (maLoai == "Loại sản phẩm") {
        res.send("Chưa chọn loại sản phẩm");
    } else {
        let sql = "UPDATE SanPham SET maLoai = '" + maLoai + "', tenSp = '" + tenSP + "', soLuongNhap = '" + soLuongNhap + "', hinhAnh = '" + hinhAnh + "', giaTien ='" + giaTien + "', giaCu = '" + giaCu + "'," +
            "thongTinSP = '" + thongTin + "' WHERE maSP = " + maSp;
        con.query(sql, function (err) {
            if (err) {
                throw new err;
                console.log(err.message);
            } else {
                res.redirect("/Product/Detail/" + maSp);
            }
        })
    }


});
//DELETE PRODUCT
router.get('/Product/DeleteProduct/:maSP', function (req, res, next) {
    try {
        let token = req.cookies;
        // console.log(token);
        let ketqua = jwt.verify(token.token, "mk");
        if (ketqua) {
            next();
        }
    } catch (e) {
        // res.json("ban can dang nhap");
        res.redirect('/');
    }
}, function (req, res, next) {
    let maSp = req.params.maSP;
    // console.log(maSp);
    con.query("UPDATE SanPham SET isDelete = 1 WHERE maSP = " + maSp, function (err) {
        if (err) {
            throw err;
            console.log(err.message);
        } else {
            res.redirect("/Home");
        }
    })
});
// ADD PRODUCT
router.get('/AddProduct', function (req, res, next) {
    res.render('AddProduct', {title: 'Thêm sản phẩm'});
});
router.post('/AddProduct', function (req, res, next) {
    let maLoai = req.body.maLoai;
    let tenSP = req.body.nameProduct;
    let soLuongNhap = req.body.numProduct;
    let hinhAnh = req.body.imgProduct;
    let giaTien = req.body.priceProduct;
    let giaCu = req.body.oldPriceProduct;
    let thongTin = req.body.moreInforProduct;
    //
    let d = new Date();
    let ngayNhap = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

    if (maLoai && tenSP && soLuongNhap && hinhAnh && giaCu && giaCu && thongTin) {
        let sql = "INSERT INTO SanPham(maSP, maLoai, tenSP, soLuongNhap, hinhAnh, giaTien, giaCu, ngayNhap, thongTinSP) " +
            "VALUES (NULL,'" + maLoai + "','" + tenSP + "','" + soLuongNhap + "', '" + hinhAnh + "','" + giaTien + "','" + giaCu + "','" + ngayNhap + "','" + thongTin + "')";
        con.query(sql, function (err) {
            if (err) {
                throw err;
            } else {
                res.redirect("/Home");
            }
        })
    }

    // res.render('AddProduct', {title: 'Thêm sản phẩm'});
});
//FILL PROCUCT
router.post("/Home/FillProduct", function (req, res, next) {
    let maLoai = req.body.maLoai;
    // console.log(maLoai);
    if (maLoai != null && maLoai != 0) {
        let sql = "SELECT * FROM SanPham WHERE maLoai = " + maLoai;
        con.query(sql, function (err, rows) {
            if (err) {
                throw  err;
            } else {
                if (rows) {
                    res.render("Home", {title: "Home", data: rows, message: ""});
                }
            }
        })
    }
})
// SEARCH PRODUCT
router.post("/Home/Search", function (req, res, next) {
    let searchNameSP = req.body.tenSP;
    // console.log(maLoai);
    if (searchNameSP != null) {
        // let sql = "SELECT * FROM SanPham WHERE tenSP LIKE '" + tenSP + "' AND isDelete = 0";
        // con.query(sql, function (err, rows) {
        //     if (err) {
        //         throw  err;
        //     } else {
        //         if (rows.length > 0) {
        //             res.render("Home", {
        //                 title: "Home",
        //                 data: rows,
        //                 message: "Đã tìm thấy " + rows.length + " sản phẩm!"
        //             });
        //         } else {
        //             res.render("Home", {title: "Home", data: [], message: "Không tìm thấy sản phẩm!"});
        //         }
        //     }
        // })
        let sql = "SELECT * FROM SanPham WHERE isDelete =0";
        con.query(sql, function (err, rows) {
            if (err) {
                throw err;
            } else {
                if (rows.length > 0) {
                    let newData = rows.filter(rows => {
                        return rows.tenSP.toLowerCase().includes(searchNameSP.toLowerCase().toString());
                    });
                    if (newData.length > 0) {
                        res.render("Home", {
                            title: "Home",
                            data: newData,
                            message: "Đã tìm thấy " + newData.length + " sản phẩm!"
                        });
                    } else {
                        res.render("Home", {
                            title: "Home",
                            data: [],
                            message: "Không tìm thấy sản phẩm!"
                        });
                    }
                }
            }
        })
    }
})
//==================== USER
router.get("/User", function (req, res, next) {
    try {
        let token = req.cookies;
        // console.log(token);
        let ketqua = jwt.verify(token.token, "mk");
        if (ketqua) {
            next();
        }
    } catch (e) {
        // res.json("ban can dang nhap");
        res.redirect('/');
    }
}, function (req, res, next) {
    let sql = "SELECT *FROM KhachHang";
    con.query(sql, function (err, rows) {
        if (err) {
            throw  err;
        } else {
            if (rows.length > 0) {
                // console.log(rows[0]);
                res.render("User", {title: "Quản lí tài khoản", data: rows, message: ""});
            }
        }
    });
})
// LOCK User
router.get('/User/LockUser/:maKH', function (req, res, next) {
    try {
        let token = req.cookies;
        // console.log(token);
        let ketqua = jwt.verify(token.token, "mk");
        if (ketqua) {
            next();
        }
    } catch (e) {
        // res.json("ban can dang nhap");
        res.redirect('/');
    }
}, function (req, res, next) {
    let maKH = req.params.maKH;
    // console.log(maSp);
    con.query("UPDATE KhachHang SET isDelete = 1 WHERE maKH = " + maKH, function (err) {
        if (err) {
            throw err;
            console.log(err.message);
        } else {
            res.redirect("/User");
        }
    })
});
// UNLOCK User
router.get('/User/Unlock/:maKH', function (req, res, next) {
    try {
        let token = req.cookies;
        // console.log(token);
        let ketqua = jwt.verify(token.token, "mk");
        if (ketqua) {
            next();
        }
    } catch (e) {
        // res.json("ban can dang nhap");
        res.redirect('/');
    }
}, function (req, res, next) {
    let maKH = req.params.maKH;
    // console.log(maSp);
    con.query("UPDATE KhachHang SET isDelete = 0 WHERE maKH = " + maKH, function (err) {
        if (err) {
            throw err;
            console.log(err.message);
        } else {
            res.redirect("/User");
        }
    })
});
// SEARCH USER
router.post("/User/Search", function (req, res, next) {
    let username = req.body.username;
    // console.log(maLoai);
    if (username != null) {
        let sql = "SELECT * FROM KhachHang WHERE tenDangNhap LIKE '" + username + "'";
        con.query(sql, function (err, rows) {
            if (err) {
                throw  err;
            } else {
                if (rows.length > 0) {
                    res.render("User", {
                        title: "Quản lí khách hành",
                        data: rows,
                        message: "Đã tìm thấy " + rows.length + " tài khoản!"
                    });
                } else {
                    res.render("User", {title: "Quản lí khách hành", data: [], message: "Không tìm thấy tài khoản!"});
                }
            }
        })
    }
})
//=====================
router.get("/Order", function (req, res, next) {
    try {
        let token = req.cookies;
        // console.log(token);
        let ketqua = jwt.verify(token.token, "mk");
        if (ketqua) {
            next();
        }
    } catch (e) {
        // res.json("ban can dang nhap");
        res.redirect('/');
    }
}, function (req, res, next) {
    let sql = "SELECT maHD,ngayBan, tongTien,isPay, KhachHang.tenDangNhap FROM HoaDon INNER JOIN KhachHang ON HoaDon.maKH = KhachHang.maKH ORDER BY HoaDon.maHD DESC";
    con.query(sql, function (err, rows) {
        if (err) {
            throw  err;
        } else {
            if (rows.length > 0) {
                console.log(rows[0]);
                res.render("Order", {title: "Quản lí đơn hàng", data: rows, message: ""});
            }
        }
    });
})

//========================API MOBILE============================
router.post("/deleteGioHangAPI", function (req, res, next) {
    let maKH = req.body.maKH;
    if (maKH) {
        let sql = "DELETE FROM GioHang WHERE maKH = " + maKH;
        con.query(sql, function (err) {
            if (err) {
                console.log(err.message);
                return res.send({
                    status: "failure",
                    message: err.message
                })
            } else {
                // return res.json({
                //     status: "susccess",
                // })
                return res.send({
                    status: "susccess",
                    message: ""
                });
            }
        })
    }
})
router.post("/deleteSanPhamGHAPI", function (req, res, next) {
    let maSP = req.body.maSP;
    let maKH = req.body.maKH;
    if (maKH != null && maSP != null) {
        let sql = "DELETE FROM `GioHang` WHERE maSP = " + maSP + " AND maKH = " + maKH;
        con.query(sql, function (err) {
            if (err) {
                console.log(err.message);
                return res.send({
                    status: "failure",
                    message: err.message
                })
            } else {
                return res.send({
                    status: "susccess",
                    message: ""
                })
            }
        })
    }
})
router.get("/getAllSanPhamAPI", function (req, res, next) {
    let sql = "SELECT* FROM SanPham WHERE isDelete = 0";
    con.query(sql, function (err, rows) {
        if (err) {
            console.log(err.message);
            return res.send({
                status: "failure",
                message: err.message
            })
        } else {
            return res.send(rows);
        }
    })

})
router.post("/getChiTietHoaDonAPI", function (req, res, next) {
    let maHD = req.body.maHD;
    let sql = "SELECT ChiTietHoaDon.maHD,SanPham.maLoai, ChiTietHoaDon.maSP,SanPham.tenSP,SanPham.soLuongNhap, SanPham.hinhAnh, SanPham.giaTien, SanPham.giaCu,SanPham.ngayNhap, SanPham.thongTinSP, ChiTietHoaDon.soLuongMua,ChiTietHoaDon.donGia " +
        "FROM ChiTietHoaDon INNER JOIN SanPham ON ChiTietHoaDon.maSP = SanPham.maSP WHERE maHD = " + maHD;
    con.query(sql, function (err, rows) {
        if (err) {
            console.log(err.message);
            return res.send({
                status: "failure",
                message: err.message
            })
        } else {
            return res.send(rows)
        }
    })

})
router.post("/getGioHangAPI", function (req, res, next) {
    let maKH = req.body.maKH;
    let sql = "SELECT SanPham.maLoai, GioHang.maSP,GioHang.maKH,SanPham.tenSP,SanPham.soLuongNhap, SanPham.hinhAnh, SanPham.giaTien, SanPham.giaCu,SanPham.ngayNhap, SanPham.thongTinSP, SUM(soLuongMua)AS soLuong " +
        "FROM GioHang INNER JOIN SanPham ON GioHang.maSP = SanPham.maSP WHERE maKH = " + maKH + " GROUP BY maSP";
    con.query(sql, function (err, rows) {
        if (err) {
            console.log(err.message);
            return res.send({
                status: "failure",
                message: err.message
            })
        } else {
            if (rows.length > 0) {
                return res.send(rows)
            } else {
                return res.send({
                    status: "failure",
                    message: ""
                })
            }
        }
    })

})
router.post("/getHoaDonAPI", function (req, res, next) {
    let maKH = req.body.maKH;
    let sql = "SELECT * FROM `HoaDon` WHERE maKH = " + maKH;
    con.query(sql, function (err, rows) {
        if (err) {
            console.log(err.message);
            return res.send({
                status: "failure",
                message: err.message
            })
        } else {
            if (rows.length > 0) {
                return res.send(rows)
            } else {
                return res.send({
                    status: "failure",
                    message: ""
                })
            }
        }
    })

})
router.post("/getKhachHangAPI", function (req, res, next) {
    let tenDangNhap = req.body.tenDangNhap;
    let sql = "SELECT* FROM KhachHang WHERE tenDangNhap = '" + tenDangNhap + "'";
    con.query(sql, function (err, rows) {
        if (err) {
            // console.log(err.message);
            return res.send({
                status: "failure",
                message: err.message
            })
        } else {
            return res.send(rows)
        }
    })

})
router.post("/getSanPhamDaMuaAPI", function (req, res, next) {
    let maKH = req.body.maKH;
    let sql = "SELECT SanPham.maLoai, SanPham.maSP, SanPham.tenSP,SanPham.tenSP, SanPham.soLuongNhap,SanPham.hinhAnh, SanPham.giaTien,SanPham.giaCu, SanPham.ngayNhap,SanPham.thongTinSP " +
        "FROM SanPham JOIN ChiTietHoaDon ON SanPham.maSP = ChiTietHoaDon.maSP JOIN HoaDon ON ChiTietHoaDon.maHD = HoaDon.maHD JOIN KhachHang ON HoaDon.maKH = KhachHang.maKH WHERE KhachHang.maKH = " + maKH + " GROUP BY ChiTietHoaDon.maSP";
    con.query(sql, function (err, rows) {
        if (err) {
            console.log(err.message);
            return res.send({
                status: "failure",
                message: err.message
            })
        } else {
            if (rows.length > 0) {
                return res.send(rows)
            } else {
                return res.send({
                    status: "failure",
                    message: ""
                })
            }
        }
    })

})
router.post("/getSpTheoMaSPAPI", function (req, res, next) {
    let maSP = req.body.maSP;
    let sql = "SELECT * FROM `SanPham` WHERE maSP =" + maSP;
    con.query(sql, function (err, rows) {
        if (err) {
            console.log(err.message);
            return res.send({
                status: "failure",
                message: err.message
            })
        } else {
            return res.send(rows)
        }
    })

})
router.post("/getSpTheoTLAPI", function (req, res, next) {
    let maLoai = req.body.maLoai;
    let sql = "SELECT* FROM SanPham WHERE maLoai ='" + maLoai + "' AND isDelete = 0";
    con.query(sql, function (err, rows) {
        if (err) {
            console.log(err.message);
            return res.send({
                status: "failure",
                message: err.message
            })
        } else {
            return res.send(rows)
        }
    })

})
router.post("/InsertChiTietHoaDonAPI", function (req, res, next) {
    let maHD = req.body.maHD;
    let maSP = req.body.maSP;
    let soLuongMua = req.body.soLuongMua;
    let donGia = req.body.donGia;


    let sql = "INSERT INTO `ChiTietHoaDon` (`maHD`, `maSP`, `soLuongMua`, `donGia`) " +
        "VALUES ('" + maHD + "','" + maSP + "','" + soLuongMua + "','" + donGia + "')";
    con.query(sql, function (err) {
        if (err) {
            console.log(err.message);
            return res.send({
                status: "failure",
                message: err.message
            })
        } else {
            return res.send({
                status: "susccess",
                message: ""
            })
        }
    })

})
router.post("/InsertGioHangAPI", function (req, res, next) {
    let maSP = req.body.maSP;
    let maKH = req.body.maKH;
    let soLuongMua = req.body.soLuongMua;

    let sql = "INSERT INTO GioHang VALUES ('" + maSP + "','" + maKH + "','" + soLuongMua + "')";
    con.query(sql, function (err, rows) {
        if (err) {
            console.log(err.message);
            return res.send({
                status: "failure",
                message: err.message
            })
        } else {
            return res.send({
                status: "susccess",
                message: ""
            })
        }
    })

})
router.post("/InsertHoaDonAPI", function (req, res, next) {

    let maKH = req.body.maKH;
    let tongTien = req.body.tongTien;
    let d = new Date();
    let ngayBan = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

    let sql = "INSERT INTO `HoaDon` (`maHD`, `maKH`, `ngayBan`, `tongTien`) VALUES (NULL, '" + maKH + "','" + ngayBan + "','" + tongTien + "')";
    con.query(sql, function (err) {
        if (err) {
            console.log(err.message);
            return res.send({
                status: "failure",
                message: err.message
            })
        } else {
            return res.send({
                status: "susccess",
                message: ""
            })
        }
    })

})
router.post("/loginAPI", function (req, res, next) {
    let tenDangNhap = req.body.tenDangNhap;
    let matKhau = req.body.matKhau;
    console.log(tenDangNhap, matKhau)
    if (tenDangNhap != null && matKhau != null) {
        let sql = "SELECT * FROM KhachHang WHERE tenDangNhap = '" + tenDangNhap + "'";
        con.query(sql, function (err, rows) {
            if (err) {
                console.log(err.message);
                return res.send({
                    status: "failure",
                    message: err.message
                })
            } else {
                if (rows.length > 0) {
                    if (rows[0].matKhau == matKhau) {
                        if (rows[0].isDelete == 1) {
                            return res.send({
                                status: "failure",
                                message: "Tài khoản của bạn đã bị khóa!"
                            })
                        } else {
                            return res.send({
                                status: "susccess",
                                message: ""
                            })
                        }
                    } else {
                        return res.send({
                            status: "failure",
                            message: "Sai mật khẩu!"
                        })
                    }
                } else {
                    return res.send({
                        status: "failure",
                        message: "Tên đăng nhập không tồn tại!"
                    })
                }
            }
        })
    }

})
router.post("/registerAPI", function (req, res, next) {
    let tenDangNhap = req.body.tenDangNhap;
    let matKhau = req.body.matKhau;
    let tenKH = req.body.tenKH;
    let namSinh = req.body.namSinh;
    let soDienThoai = req.body.soDienThoai;
    let diaChi = req.body.diaChi;
    if (tenDangNhap != null && matKhau != null && tenKH != null && namSinh != null && soDienThoai != null && diaChi != null) {
        let sql = "SELECT * FROM KhachHang WHERE tenDangNhap = '" + tenDangNhap + "'";
        con.query(sql, function (err, rows) {
            if (err) {
                console.log(err.message);
                return res.send({
                    status: "failure",
                    message: err.message
                })
            } else {
                if (rows.length > 0) {
                    return res.send({
                        status: "failure",
                        message: "Tên đăng nhập đã tồn tại!"
                    })
                } else {
                    let sql1 = "insert into KhachHang values(NULL,'" + tenDangNhap + "', '" + matKhau + "','" + tenKH + "','" + namSinh + "','" + soDienThoai + "','" + diaChi + "','0')";
                    con.query(sql1, function (err) {
                        if (err) {
                            console.log("err: " + err.message);
                            return res.send({
                                status: "failure",
                                message: err.message
                            })
                        } else {
                            return res.send({
                                status: "susccess",
                                message: ""
                            })
                        }
                    })
                }
            }
        })
    } else {
        return res.send({
            status: "failure",
            message: "Không để trống các trường!"
        })
    }

})
router.get("/SPMoiNhatAPI", function (req, res, next) {
    let sql = "SELECT * FROM SanPham ORDER BY ngayNhap DESC LIMIT 20";
    con.query(sql, function (err, rows) {
        if (err) {
            console.log(err.message);
            return res.send({
                status: "failure",
                message: err.message
            })
        } else {
            return res.send(rows);
        }
    })

})
router.post("/updateKhachHangAPI", function (req, res, next) {
    let maKH = req.body.maKH;
    let tenKH = req.body.tenKH;
    let namSinh = req.body.namSinh;
    let soDienThoai = req.body.soDienThoai;
    let diaChi = req.body.diaChi;
    if (maKH != null && tenKH != null && namSinh != null && soDienThoai != null && diaChi != null) {
        let sql = "UPDATE `KhachHang` SET `tenKH`='" + tenKH + "',`namSinh`='" + namSinh + "',`soDienThoai`='" + soDienThoai + "',`diaChi`='" + diaChi + "' WHERE maKH = '" + maKH + "'";
        con.query(sql, function (err, rows) {
            if (err) {
                console.log(err.message);
                return res.send({
                    status: "failure",
                    message: err.message
                })
            } else {
                return res.send({
                    status: "susccess",
                    message: ""
                });
            }
        })
    }

})
router.post("/updateMatKhauAPI", function (req, res, next) {
    let maKH = req.body.maKH;
    let matKhau = req.body.matKhau;
    if (maKH != null && matKhau != null) {
        let sql = "UPDATE `KhachHang` SET `matKhau` = '" + matKhau + "' WHERE maKH = '" + maKH + "'";
        con.query(sql, function (err, rows) {
            if (err) {
                console.log(err.message);
                return res.send({
                    status: "failure",
                    message: err.message
                })
            } else {
                return res.send({
                    status: "susccess",
                    message: ""
                });
            }
        })
    }

})
router.post("/UpdateSanPhamAPI", function (req, res, next) {
    let maSP = req.body.maSP;
    let soLuongNhap = req.body.soLuongNhap;
    if (maSP != null && soLuongNhap != null) {
        let sql = "UPDATE SanPham SET soLuongNhap = '" + soLuongNhap + "' WHERE maSP = '" + maSP + "'";
        con.query(sql, function (err, rows) {
            if (err) {
                console.log(err.message);
                return res.send({
                    status: "failure",
                    message: err.message
                })
            } else {
                return res.send({
                    status: "susccess",
                    message: ""
                });
            }
        })
    }

})


module.exports = router;

