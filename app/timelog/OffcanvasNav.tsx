'use client'
import{useEffect}from'react'
import Link from 'next/link'
import styles from './offcanvas.scss'

export default function OffcanvasNav(){
    useEffect(()=>{
        import('bootstrap/dist/js/bootstrap.bundle.min.js')
    },[])
    return(
        <div>
            <button
            className="btn btn-outline-primary mb-3"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasMenu"
            >
            Sidebar
            </button>

            <div className="offcanvas offcanvas-start" id="offcanvasMenu">
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title">功能選單</h5>
                    <button className="btn-close" data-bs-dismiss="offcanvas"></button>
                </div>
                <div className="offcanvas-body">
                    <ul className="nav nav-tabs flex-column">
                        <li className="nav-item"><a href="" className="nav-link active"></a></li>
                        <li className="nav-item"><a href="" className="nav-link">History</a></li>
                        <li className="nav-item"><a className="nav-link">Analysis Room</a></li>

                        <li className="nav-item"><Link className="nav-link" href="/blog">部落格列表</Link></li>
                        <li className="nav-item"><Link className="nav-link" href="/cart">購物車範例</Link></li>
                        <li className="nav-item"><Link className="nav-link" href="/cart/coupon">購物車-折價券</Link></li>
                        <li className="nav-item"><Link className="nav-link" href="/ecpay">綠界金流</Link></li>
                        <li className="nav-item"><Link className="nav-link" href="/fav">我的最愛範例</Link></li>
                        <li className="nav-item"><Link className="nav-link" href="/line-pay">Line Pay金流</Link></li>
                        <li className="nav-item"><Link className="nav-link" href="/loader">手動載入用</Link></li>
                        <li className="nav-item"><Link className="nav-link" href="/loader/placeholder">與佔位符配合用</Link></li>
                        <li className="nav-item"><Link className="nav-link" href="/product-no-db">無連接後端與資料庫</Link></li>
                        <li className="nav-item"><Link className="nav-link" href="/product-fetch/list">只使用fetch</Link></li>
                        <li className="nav-item"><Link className="nav-link" href="/product/list">一般列表-useSWR</Link></li>
                        <li className="nav-item"><Link className="nav-link" href="/product/list-loadmore">載入更多列表-useSWR</Link></li>
                        <li className="nav-item"><Link className="nav-link" href="/product/list-is">捲動載入列表-useSWR</Link></li>
                        <li className="nav-item"><Link className="nav-link" href="/ship">運送商店選擇</Link></li>
                        <li className="nav-item"><Link className="nav-link" href="/user">會員登入/註冊/修改資料/忘記密碼</Link></li>
                        <li className="nav-item"><Link className="nav-link" href="/user/google-login">Google登入整合</Link></li>
                        <li className="nav-item"><Link className="nav-link" href="/user/line-login">Line登入整合</Link></li>
                        <li className="nav-item"><Link className="nav-link" href="/user/forget-password">忘記密碼OTP單頁式</Link></li>
                    </ul>
                
                </div>
            </div>
        </div>
    )
}