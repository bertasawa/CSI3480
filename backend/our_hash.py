def left_rotate(x: int, n: int) -> int:
    return ((x << n) | (x >> (32 - n))) & 0xFFFFFFFF

def our_sha1(input: str) -> str:
    input = input.encode("utf-8")
    
    h0 = 0x67452301
    h1 = 0xEFCDAB89
    h2 = 0x98BADCFE
    h3 = 0x10325476
    h4 = 0xC3D2E1F0
    
    original_len = len(input) * 8

    # pre processing
    # add '1' to end
    input += b'\x80'
    # add '0's 
    while (len(input) % 64) != 56:
        input += b'\x00'
    # add original length as 64bit int
    input += original_len.to_bytes(8, byteorder="big")
    # now length of input is a multiple of 512 bits

    # for each 64 bytes chunk
    for chunks in range(0, len(input), 64):
        chunk = input[chunks : chunks + 64]
        
        w = [int.from_bytes(chunk[i : i + 4], "big") for i in range(0, 64, 4)]
        
        for i in range (16, 80):
            x = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16]
            w.append(left_rotate(x, 1))

        a = h0
        b = h1
        c = h2
        d = h3
        e = h4
        
        for j in range(80):
            if 0 <= j <= 19:
                f = (b & c) | ((~b) & d)
                k = 0x5A827999
            elif 20 <= j <= 39:
                f = b ^ c ^ d
                k = 0x6ED9EBA1
            elif 40 <= j <= 59:
                f = (b & c) | (b & d) | (c & d)
                k = 0x8F1BBCDC
            else:  # 60..79
                f = b ^ c ^ d
                k = 0xCA62C1D6

            temp = (left_rotate(a, 5) + f + e + k + w[j]) & 0xFFFFFFFF
            e = d
            d = c
            c = left_rotate(b, 30)
            b = a
            a = temp

        h0 = (h0 + a) & 0xFFFFFFFF
        h1 = (h1 + b) & 0xFFFFFFFF
        h2 = (h2 + c) & 0xFFFFFFFF
        h3 = (h3 + d) & 0xFFFFFFFF
        h4 = (h4 + e) & 0xFFFFFFFF
 
    return '{:08x}{:08x}{:08x}{:08x}{:08x}'.format(h0, h1, h2, h3, h4)