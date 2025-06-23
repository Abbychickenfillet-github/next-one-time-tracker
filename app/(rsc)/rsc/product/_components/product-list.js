'use client'

import { ListMotionContainer, ListMotionItem } from '@/components/list-motion'
import Image from 'next/image'
import styles from '../_styles/gallery.module.scss'
import Link from 'next/link'

export default function ProductList({ products = [] }) {
  return (
    <>
      <div className={styles.block}>
        <ListMotionContainer element="ul">
          {products.map((product) => (
            <ListMotionItem
              key={product.id}
              element="li"
              className={styles.gridItem}
            >
              <Link
                className={styles['art__link']}
                href={`/rsc/product/detail?id=${product.id}`}
              >
                <Image
                  className={styles['art__img']}
                  src={`/images/product/thumb/${product.photos.split(',')[0]}`}
                  alt={product.name}
                  width={150}
                  height={150}
                />
                <span className={styles['art__title']}>{product.name}</span>
                <span className={styles['art__author']}>
                  NT$ {product.price.toLocaleString()}
                </span>
              </Link>
            </ListMotionItem>
          ))}
        </ListMotionContainer>
      </div>
    </>
  )
}
